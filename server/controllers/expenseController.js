const Expense = require('../models/Expense');
const Income  = require('../models/Income');
const Budget  = require('../models/Budget');

async function syncBudget(userId, category, month, year) {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);
  const agg = await Expense.aggregate([
    { $match: { user: userId, category, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const total = agg.length ? agg[0].total : 0;
  await Budget.findOneAndUpdate(
    { user: userId, category, month, year },
    { spentAmount: total }
  );
}

async function getBalance(userId) {
  const [inc, exp] = await Promise.all([
    Income.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);
  return (inc[0]?.total || 0) - (exp[0]?.total || 0);
}

exports.getExpenses = async (req, res) => {
  try {
    const { category, paymentMethod, search, startDate, endDate } = req.query;
    let query = { user: req.user._id };
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, paymentMethod, date, description } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'Title and amount are required' });
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    const balance = await getBalance(req.user._id);
    if (amount > balance) {
      return res.status(400).json({
        message: `Insufficient balance! Your balance is \u20B9${balance.toLocaleString('en-IN')}. Add income first before adding expenses.`
      });
    }

    const expDate = date ? new Date(date) : new Date();
    const expense = await Expense.create({ user: req.user._id, title, amount, category, paymentMethod, date: expDate, description });

    await syncBudget(req.user._id, category, expDate.getMonth() + 1, expDate.getFullYear());
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const old = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!old) return res.status(404).json({ message: 'Expense not found' });

    const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : old.amount;
    const diff = newAmount - old.amount;
    if (diff > 0) {
      const balance = await getBalance(req.user._id);
      if (diff > balance) return res.status(400).json({ message: `Insufficient balance! Available: \u20B9${balance.toLocaleString('en-IN')}` });
    }

    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    const expDate = new Date(expense.date);
    const month = expDate.getMonth() + 1;
    const year  = expDate.getFullYear();
    await syncBudget(req.user._id, old.category, month, year);
    if (req.body.category && req.body.category !== old.category) {
      await syncBudget(req.user._id, req.body.category, month, year);
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const expDate = new Date(expense.date);
    await syncBudget(req.user._id, expense.category, expDate.getMonth() + 1, expDate.getFullYear());
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const now    = new Date();
    const month  = now.getMonth() + 1;
    const year   = now.getFullYear();
    const mStart = new Date(year, month - 1, 1);
    const mEnd   = new Date(year, month, 1);

    const [totalInc, totalExp, monthInc, monthExp, catBreakdown] = await Promise.all([
      Income.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $match: { user: req.user._id, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }])
    ]);

    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d  = new Date(year, month - 1 - i, 1);
      const d2 = new Date(year, month - i, 1);
      const [inc, exp] = await Promise.all([
        Income.aggregate([{ $match: { user: req.user._id, date: { $gte: d, $lt: d2 } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: d, $lt: d2 } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
      ]);
      trend.push({ month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), income: inc[0]?.total || 0, expense: exp[0]?.total || 0 });
    }

    res.json({
      allTimeBalance:   (totalInc[0]?.total || 0) - (totalExp[0]?.total || 0),
      allTimeIncome:    totalInc[0]?.total  || 0,
      allTimeExpense:   totalExp[0]?.total  || 0,
      monthlyIncome:    monthInc[0]?.total  || 0,
      monthlyExpense:   monthExp[0]?.total  || 0,
      monthlyBalance:   (monthInc[0]?.total || 0) - (monthExp[0]?.total || 0),
      catBreakdown,
      trend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

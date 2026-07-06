const Income = require('../models/Income');

exports.getIncomes = async (req, res) => {
  try {
    const { source, search } = req.query;
    let query = { user: req.user._id };
    if (source) query.source = source;
    if (search) query.title = { $regex: search, $options: 'i' };
    const incomes = await Income.find(query).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createIncome = async (req, res) => {
  try {
    const { title, amount, source, date, description } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'Title and amount are required' });
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
    const income = await Income.create({ user: req.user._id, title, amount, source, date: date || new Date(), description });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

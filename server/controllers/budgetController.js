const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const budgets = await Budget.find({ user: req.user._id, month, year });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category, budgetAmount } = req.body;
    if (!category || !budgetAmount) return res.status(400).json({ message: 'Category and amount required' });
    const month = parseInt(req.body.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.body.year)  || new Date().getFullYear();
    const existing = await Budget.findOne({ user: req.user._id, category, month, year });
    if (existing) {
      existing.budgetAmount = budgetAmount;
      await existing.save();
      return res.json(existing);
    }
    const budget = await Budget.create({ user: req.user._id, category, budgetAmount, spentAmount: 0, month, year });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

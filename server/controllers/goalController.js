const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const now = new Date();
    for (let g of goals) {
      if (g.status === 'In Progress' && new Date(g.deadline) < now) {
        g.status = 'Overdue'; await g.save();
      }
    }
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, category, targetAmount, savedAmount, deadline, notes } = req.body;
    if (!name || !targetAmount || !deadline)
      return res.status(400).json({ message: 'Name, target amount and deadline are required' });
    const saved = savedAmount || 0;
    const status = saved >= targetAmount ? 'Completed' : new Date(deadline) < new Date() ? 'Overdue' : 'In Progress';
    const goal = await Goal.create({ user: req.user._id, name, category, targetAmount, savedAmount: saved, deadline, notes, status });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.depositToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' });
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    goal.savedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
    if (goal.savedAmount >= goal.targetAmount) goal.status = 'Completed';
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

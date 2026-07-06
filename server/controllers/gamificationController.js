const User    = require('../models/User');
const Expense = require('../models/Expense');
const Income  = require('../models/Income');
const Goal    = require('../models/Goal');

const BADGE_DEFINITIONS = [
  { name: 'First Steps',       icon: '👣', desc: 'Logged your first expense', check: (stats) => stats.totalExpenses >= 1 },
  { name: 'Budget Beginner',   icon: '📋', desc: 'Set your first budget', check: (stats) => stats.totalBudgets >= 1 },
  { name: 'Goal Setter',       icon: '🎯', desc: 'Created your first savings goal', check: (stats) => stats.totalGoals >= 1 },
  { name: 'Income Logger',     icon: '💰', desc: 'Logged your first income', check: (stats) => stats.totalIncomes >= 1 },
  { name: 'Expense Tracker',   icon: '📝', desc: 'Logged 10 expenses', check: (stats) => stats.totalExpenses >= 10 },
  { name: 'Centurion',         icon: '💯', desc: 'Logged 100 expenses', check: (stats) => stats.totalExpenses >= 100 },
  { name: 'Saver Star',        icon: '⭐', desc: 'Saved 20% or more this month', check: (stats) => stats.savingsRate >= 20 },
  { name: 'Super Saver',       icon: '🌟', desc: 'Saved 40% or more this month', check: (stats) => stats.savingsRate >= 40 },
  { name: 'Goal Crusher',      icon: '🏆', desc: 'Completed a savings goal', check: (stats) => stats.completedGoals >= 1 },
  { name: 'Streak Master',     icon: '🔥', desc: 'Maintained 7-day streak', check: (stats) => stats.currentStreak >= 7 },
  { name: 'Monthly Champion',  icon: '👑', desc: 'Maintained 30-day streak', check: (stats) => stats.currentStreak >= 30 },
  { name: 'Rich Mindset',      icon: '🧠', desc: 'Earned 500+ points', check: (stats) => stats.points >= 500 },
  { name: 'Finance Pro',       icon: '📊', desc: 'Financial score above 80', check: (stats) => stats.financialScore >= 80 },
];

exports.updateActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let pointsEarned = 5;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const lastDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;
        pointsEarned += user.currentStreak * 2;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.lastActiveDate = now;
    user.points += pointsEarned;
    await user.save();

    res.json({
      points: user.points,
      pointsEarned,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const now = new Date();
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const mEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [expCount, incCount, monthInc, monthExp, goalsDone, budgetCount] = await Promise.all([
      Expense.countDocuments({ user: userId }),
      Income.countDocuments({ user: userId }),
      Income.aggregate([{ $match: { user: userId, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: userId, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Goal.countDocuments({ user: userId, status: 'Completed' }),
      require('../models/Budget').countDocuments({ user: userId })
    ]);

    const mI = monthInc[0]?.total || 0;
    const mE = monthExp[0]?.total || 0;
    const savingsRate = mI > 0 ? ((mI - mE) / mI) * 100 : 0;

    const stats = {
      totalExpenses: expCount,
      totalIncomes: incCount,
      totalBudgets: budgetCount,
      totalGoals: await Goal.countDocuments({ user: userId }),
      completedGoals: goalsDone,
      savingsRate: Math.round(savingsRate),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      points: user.points,
      financialScore: user.financialScore
    };

    const existingBadgeNames = user.badges.map(b => b.name);
    const newBadges = [];

    for (const badge of BADGE_DEFINITIONS) {
      if (!existingBadgeNames.includes(badge.name) && badge.check(stats)) {
        const newBadge = { name: badge.name, icon: badge.icon, desc: badge.desc, earnedAt: new Date() };
        user.badges.push(newBadge);
        newBadges.push(newBadge);
        user.points += 25;
      }
    }

    if (newBadges.length > 0) {
      await user.save();
    }

    res.json({
      ...stats,
      points: user.points,
      badges: user.badges,
      newBadges,
      level: Math.floor(user.points / 100) + 1,
      nextLevelPoints: ((Math.floor(user.points / 100) + 1) * 100) - user.points
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMotivation = async (req, res) => {
  try {
    const quotes = [
      "A budget is telling your money where to go instead of wondering where it went.",
      "The habit of saving is itself an education; it fosters every virtue.",
      "Do not save what is left after spending, but spend what is left after saving.",
      "Financial freedom is available to those who learn about it and work for it.",
      "It's not your salary that makes you rich, it's your spending habits.",
      "Beware of little expenses; a small leak will sink a great ship.",
      "The art is not in making money, but in keeping it.",
      "Money looks better in the bank than on your feet.",
      "Every time you borrow money, you're robbing your future self.",
      "Wealth is not about having a lot of money; it's about having a lot of options.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Don't tell me what you value, show me your budget, and I'll tell you what you value."
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ quote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

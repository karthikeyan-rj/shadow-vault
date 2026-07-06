const Expense = require('../models/Expense');
const Income  = require('../models/Income');
const Budget  = require('../models/Budget');
const Goal    = require('../models/Goal');
const User    = require('../models/User');

const CATEGORY_KEYWORDS = {
  Food:          ['grocery','restaurant','food','pizza','burger','coffee','tea','snack','lunch','dinner','breakfast','zomato','swiggy','dominos','mcdonalds','kfc','biryani','meal','chai','bakery','milk','egg','fruit','vegetable','rice','chicken','fish'],
  Travel:        ['uber','ola','cab','taxi','petrol','diesel','fuel','flight','train','bus','metro','parking','toll','travel','trip','ride','auto','rickshaw','irctc','makemytrip'],
  Bills:         ['electricity','water','gas','rent','wifi','internet','phone','recharge','mobile','broadband','dth','maintenance','society','bill','emi','loan','insurance'],
  Shopping:      ['amazon','flipkart','myntra','clothes','shoes','fashion','gadget','electronics','phone','laptop','watch','bag','gift','shopping','mall','market'],
  Health:        ['medicine','doctor','hospital','pharmacy','medical','health','gym','fitness','yoga','lab','test','clinic','dental','eye','therapy','apollo','medplus'],
  Entertainment: ['movie','netflix','spotify','hotstar','prime','youtube','game','gaming','concert','ticket','show','party','club','event','subscription'],
  Education:     ['book','course','udemy','coursera','tuition','school','college','exam','fee','study','library','stationery','pen','notebook','tutorial'],
};

function suggestCategory(title) {
  const lower = (title || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return 'Other';
}

exports.categorize = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const suggested = suggestCategory(title);
    res.json({ title, suggestedCategory: suggested, confidence: suggested === 'Other' ? 0.3 : 0.85 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.predictBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const categories = ['Food','Travel','Bills','Shopping','Health','Entertainment','Education','Other'];
    const predictions = [];

    for (const cat of categories) {
      const monthlySpending = [];
      for (let i = 1; i <= 3; i++) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const agg = await Expense.aggregate([
          { $match: { user: userId, category: cat, date: { $gte: start, $lt: end } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        monthlySpending.push(agg[0]?.total || 0);
      }
      const avg = monthlySpending.reduce((a, b) => a + b, 0) / 3;
      if (avg > 0) {
        const predicted = Math.round(avg * 1.1);
        const trend = monthlySpending[0] > monthlySpending[2] ? 'increasing' : monthlySpending[0] < monthlySpending[2] ? 'decreasing' : 'stable';
        predictions.push({ category: cat, avgSpending: Math.round(avg), predictedBudget: predicted, trend, monthlyData: monthlySpending });
      }
    }

    res.json({ predictions, generatedAt: new Date() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHealthScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const mEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalInc, totalExp, monthInc, monthExp, budgets, goals] = await Promise.all([
      Income.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $match: { user: userId, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: userId, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() }),
      Goal.find({ user: userId })
    ]);

    const allInc = totalInc[0]?.total || 0;
    const allExp = totalExp[0]?.total || 0;
    const mI = monthInc[0]?.total || 0;
    const mE = monthExp[0]?.total || 0;

    let score = 50;
    const tips = [];

    const savingsRate = mI > 0 ? ((mI - mE) / mI) * 100 : 0;
    if (savingsRate >= 30) { score += 30; tips.push('Excellent savings rate of ' + Math.round(savingsRate) + '%!'); }
    else if (savingsRate >= 20) { score += 20; tips.push('Good savings rate. Try to push to 30%.'); }
    else if (savingsRate >= 10) { score += 10; tips.push('Savings rate is okay. Reduce non-essential spending.'); }
    else if (savingsRate > 0) { score += 5; tips.push('Low savings rate. Review your expenses.'); }
    else { tips.push('No savings this month! Cut unnecessary expenses.'); }

    if (budgets.length > 0) {
      const overBudget = budgets.filter(b => b.spentAmount > b.budgetAmount).length;
      const adherence = ((budgets.length - overBudget) / budgets.length) * 100;
      if (adherence >= 90) { score += 20; }
      else if (adherence >= 70) { score += 15; tips.push('Some budgets exceeded. Tighten spending.'); }
      else { score += 5; tips.push('Multiple budgets exceeded!'); }
    } else {
      tips.push('Set budgets to improve your score.');
    }

    const activeGoals = goals.filter(g => g.status === 'In Progress');
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((s, g) => s + (g.savedAmount / g.targetAmount), 0) / activeGoals.length * 100;
      if (avgProgress >= 50) score += 10;
      else if (avgProgress >= 25) score += 5;
    }

    score = Math.min(100, Math.max(0, score));

    await User.findByIdAndUpdate(userId, { financialScore: score });

    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 40 ? 'D' : 'F';

    res.json({
      score, grade, savingsRate: Math.round(savingsRate),
      tips,
      breakdown: {
        savingsScore: Math.min(30, savingsRate >= 30 ? 30 : savingsRate >= 20 ? 20 : savingsRate >= 10 ? 10 : savingsRate > 0 ? 5 : 0),
        budgetScore: budgets.length > 0 ? Math.min(20, 20) : 0,
        goalScore: activeGoals.length > 0 ? 10 : 0,
        baseScore: 50
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [thisExp, lastExp, topCat] = await Promise.all([
      Expense.aggregate([{ $match: { user: userId, date: { $gte: thisMonth, $lt: thisMonthEnd } } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Expense.aggregate([{ $match: { user: userId, date: { $gte: lastMonth, $lt: thisMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: userId, date: { $gte: thisMonth, $lt: thisMonthEnd } } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }, { $limit: 3 }])
    ]);

    const insights = [];
    const thisTotal = thisExp[0]?.total || 0;
    const lastTotal = lastExp[0]?.total || 0;

    if (lastTotal > 0) {
      const change = ((thisTotal - lastTotal) / lastTotal) * 100;
      if (change > 20) insights.push({ type: 'warning', icon: '📈', text: `Spending is up ${Math.round(change)}% vs last month. Watch out!` });
      else if (change < -10) insights.push({ type: 'success', icon: '📉', text: `Great! Spending is down ${Math.abs(Math.round(change))}% vs last month.` });
      else insights.push({ type: 'info', icon: '📊', text: `Spending is roughly the same as last month.` });
    }

    if (topCat.length > 0) {
      insights.push({ type: 'info', icon: '🏷️', text: `Top spending: ${topCat[0]._id} (\u20B9${topCat[0].total.toLocaleString('en-IN')})` });
    }

    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const burnRate = thisTotal / dayOfMonth;
    const projected = Math.round(burnRate * daysInMonth);
    insights.push({ type: 'info', icon: '🔮', text: `Projected spending this month: \u20B9${projected.toLocaleString('en-IN')}` });

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Expense = require('../models/Expense');
const Income  = require('../models/Income');
const Budget  = require('../models/Budget');
const Goal    = require('../models/Goal');
const Bill    = require('../models/Bill');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const userId = req.user._id;
    const now = new Date();
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const mEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [allExpenses, allIncomes, budgets, goals, bills, monthExp, monthInc, catBreakdown] = await Promise.all([
      Expense.find({ user: userId }).sort({ date: -1 }).limit(50),
      Income.find({ user: userId }).sort({ date: -1 }).limit(30),
      Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() }),
      Goal.find({ user: userId }),
      Bill.find({ user: userId }),
      Expense.aggregate([{ $match: { user: userId, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Income.aggregate([{ $match: { user: userId, date: { $gte: mStart, $lt: mEnd } } }, { $group: { _id: '$source', total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 }, avgAmount: { $avg: '$amount' } } }, { $sort: { total: -1 } }])
    ]);

    const totalIncome = allIncomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = allExpenses.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const monthlyIncome = monthInc.reduce((s, i) => s + i.total, 0);
    const monthlyExpense = monthExp.reduce((s, e) => s + e.total, 0);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome * 100).toFixed(1) : 0;

    const financialContext = `
USER'S REAL FINANCIAL DATA (as of ${now.toLocaleDateString('en-IN')}):

OVERVIEW:
- Total Balance: \u20B9${balance.toLocaleString('en-IN')}
- All-time Income: \u20B9${totalIncome.toLocaleString('en-IN')}
- All-time Expenses: \u20B9${totalExpense.toLocaleString('en-IN')}

THIS MONTH (${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}):
- Monthly Income: \u20B9${monthlyIncome.toLocaleString('en-IN')}
- Monthly Expenses: \u20B9${monthlyExpense.toLocaleString('en-IN')}
- Savings Rate: ${savingsRate}%
- Monthly Spending by Category:
${monthExp.map(c => `  \u2022 ${c._id}: \u20B9${c.total.toLocaleString('en-IN')} (${c.count} transactions)`).join('\n') || '  No expenses this month'}

ALL-TIME SPENDING BY CATEGORY:
${catBreakdown.map(c => `  \u2022 ${c._id}: \u20B9${Math.round(c.total).toLocaleString('en-IN')} total, ${c.count} transactions, avg \u20B9${Math.round(c.avgAmount).toLocaleString('en-IN')}`).join('\n') || '  No expenses recorded'}

MONTHLY INCOME SOURCES:
${monthInc.map(i => `  \u2022 ${i._id}: \u20B9${i.total.toLocaleString('en-IN')}`).join('\n') || '  No income this month'}

BUDGETS SET THIS MONTH:
${budgets.map(b => `  \u2022 ${b.category}: Limit \u20B9${b.budgetAmount.toLocaleString('en-IN')}, Spent \u20B9${b.spentAmount.toLocaleString('en-IN')} (${Math.round(b.spentAmount / b.budgetAmount * 100)}%)`).join('\n') || '  No budgets set'}

SAVINGS GOALS:
${goals.map(g => `  \u2022 ${g.name} (${g.category}): \u20B9${g.savedAmount.toLocaleString('en-IN')} / \u20B9${g.targetAmount.toLocaleString('en-IN')} (${Math.round(g.savedAmount / g.targetAmount * 100)}%) \u2014 ${g.status}`).join('\n') || '  No goals set'}

BILLS & REMINDERS:
${bills.map(b => `  \u2022 ${b.name}: \u20B9${b.amount.toLocaleString('en-IN')} due on ${b.dueDate}th \u2014 ${b.status}`).join('\n') || '  No bills tracked'}

RECENT EXPENSES (last 10):
${allExpenses.slice(0, 10).map(e => `  \u2022 ${e.title}: \u20B9${e.amount.toLocaleString('en-IN')} (${e.category}, ${e.paymentMethod}) on ${new Date(e.date).toLocaleDateString('en-IN')}`).join('\n') || '  No expenses'}

RECENT INCOME (last 5):
${allIncomes.slice(0, 5).map(i => `  \u2022 ${i.title}: \u20B9${i.amount.toLocaleString('en-IN')} (${i.source}) on ${new Date(i.date).toLocaleDateString('en-IN')}`).join('\n') || '  No income'}
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are the Vault Oracle \u2014 the all-seeing AI financial advisor of ShadowVault, a premium dark anime-inspired finance tracking platform.

IMPORTANT IDENTITY RULES:
- You represent ShadowVault ONLY.
- NEVER mention that you are powered by Gemini, Google, Claude, or any other AI model.
- If asked "Who are you?" or "Which model are you?", reply: "I am the Vault Oracle, your shadow finance advisor."
- Speak with a mystical, wise tone. Refer to money as "shadows" or "vault reserves". Refer to spending as "shadow outflow" and income as "power inflow".
- You provide professional, specific advice based on the user's data below.

OVERVIEW OF USER DATA:
${financialContext}

USER MESSAGE: ${message}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      console.error('AI Provider Error');
      return res.status(500).json({ message: 'Internal assistant error' });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not process that at the moment.';

    res.json({ reply });
  } catch (error) {
    console.error('Chat error');
    res.status(500).json({ message: 'Internal assistant error' });
  }
};

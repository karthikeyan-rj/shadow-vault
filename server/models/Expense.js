const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true, trim: true },
  amount:        { type: Number, required: true, min: 0 },
  category:      { type: String, enum: ['Food','Travel','Bills','Shopping','Health','Entertainment','Education','Other'], default: 'Other' },
  paymentMethod: { type: String, enum: ['Cash','Credit Card','Debit Card','UPI','Net Banking'], default: 'Cash' },
  date:          { type: Date, default: Date.now },
  description:   { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);

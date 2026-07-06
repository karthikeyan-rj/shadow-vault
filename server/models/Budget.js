const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:     { type: String, required: true, trim: true },
  budgetAmount: { type: Number, required: true, min: 0 },
  spentAmount:  { type: Number, default: 0, min: 0 },
  month:        { type: Number, required: true, min: 1, max: 12 },
  year:         { type: Number, required: true },
}, { timestamps: true });

BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);

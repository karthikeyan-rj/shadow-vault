const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  source:      { type: String, enum: ['Salary','Freelance','Business','Investment','Gift','Other'], default: 'Other' },
  date:        { type: Date, default: Date.now },
  description: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Income', IncomeSchema);

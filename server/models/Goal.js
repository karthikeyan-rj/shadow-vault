const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true, trim: true },
  category:     { type: String, default: 'Other' },
  targetAmount: { type: Number, required: true, min: 0 },
  savedAmount:  { type: Number, default: 0, min: 0 },
  deadline:     { type: Date, required: true },
  notes:        { type: String, trim: true, default: '' },
  status:       { type: String, enum: ['In Progress','Completed','Overdue'], default: 'In Progress' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);

const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  category:    { type: String, enum: ['Rent','Electricity','Water','Internet','Phone','Insurance','Subscription','EMI','Other'], default: 'Other' },
  dueDate:     { type: Number, required: true, min: 1, max: 31 },
  isRecurring: { type: Boolean, default: true },
  isPaid:      { type: Boolean, default: false },
  paidDate:    { type: Date, default: null },
  lastPaidMonth: { type: Number, default: 0 },
  lastPaidYear:  { type: Number, default: 0 },
  notes:       { type: String, trim: true, default: '' },
  status:      { type: String, enum: ['Upcoming','Due Today','Overdue','Paid'], default: 'Upcoming' },
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);

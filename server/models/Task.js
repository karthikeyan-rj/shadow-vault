const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, default: 0 },
  category: { type: String, default: 'General', trim: true },
  note: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  taskDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);

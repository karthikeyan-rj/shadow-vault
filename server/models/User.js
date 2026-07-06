const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  points:         { type: Number, default: 0 },
  currentStreak:  { type: Number, default: 0 },
  longestStreak:  { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  badges:         [{
    name:      { type: String },
    icon:      { type: String },
    earnedAt:  { type: Date, default: Date.now },
    desc:      { type: String }
  }],
  financialScore: { type: Number, default: 50, min: 0, max: 100 },
  themePreference: { type: String, enum: ['dark', 'light'], default: 'dark' },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

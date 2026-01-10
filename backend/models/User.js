const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  achievements: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],
  lastLogin: { type: Date },
  loginStreak: { type: Number, default: 0 },
  title: { type: String, default: 'Medical Aspirant' },
  chatbotUsageCount: { type: Number, default: 0 },
  storyGamesCompleted: { type: Number, default: 0 },
  successfulSimulations: { type: Number, default: 0 },
  failedSimulations: { type: Number, default: 0 },
  criticalSimsResolved: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

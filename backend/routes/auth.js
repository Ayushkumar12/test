const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');
const { checkAndAwardAchievements } = require('../utils/achievementHandler');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    await logActivity(user._id, 'REGISTER', 'User registered');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).send({ user: userResponse, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, hasPassword: !!password });

    // Check hardcoded admin
    if (email === 'admin@example.com' && password === 'admin123') {
      // Ensure admin user exists in DB or just return a token with admin role
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ name: 'Admin', email, password, role: 'admin' });
        await user.save();
      } else {
        // Update existing user to ensure admin role and name are set
        let needsSave = false;
        if (user.role !== 'admin') {
          user.role = 'admin';
          needsSave = true;
        }
        if (!user.name) {
          user.name = 'Admin';
          needsSave = true;
        }
        if (needsSave) {
          await user.save();
        }
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      await logActivity(user._id, 'LOGIN', 'Admin login');
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      console.log('Admin login successful');
      return res.send({ user: userResponse, token });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }

    // Update login streak and last login
    const now = new Date();
    const lastLogin = user.lastLogin;
    
    if (!lastLogin) {
      user.loginStreak = 1;
    } else {
      const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
      const todayDate = new Date(now).setHours(0, 0, 0, 0);
      const diffDays = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.loginStreak += 1;
      } else if (diffDays > 1) {
        user.loginStreak = 1;
      }
      // if diffDays === 0, keep current streak
    }
    
    user.lastLogin = now;
    await user.save();

    // Check achievements
    const newAchievements = await checkAndAwardAchievements(user._id);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    await logActivity(user._id, 'LOGIN', 'Student login');
    // Remove password from response
    const userResponse = (await User.findById(user._id)).toObject();
    delete userResponse.password;
    res.send({ user: userResponse, token, newAchievements });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;

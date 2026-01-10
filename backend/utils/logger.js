const Activity = require('../models/Activity');

const logActivity = async (userId, action, details = '') => {
  try {
    const activity = new Activity({
      user: userId,
      action,
      details
    });
    await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Activity = require('../models/Activity');
const { auth, adminAuth } = require('../middleware/authMiddleware');

// Get all students with their stats
router.get('/students', auth, adminAuth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    const studentStats = await Promise.all(students.map(async (student) => {
      const attempts = await Attempt.find({ user: student._id });
      const totalQuizzes = attempts.length;
      const avgScore = totalQuizzes > 0 
        ? (attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions), 0) / totalQuizzes) * 100 
        : 0;
      const lastAttempt = totalQuizzes > 0 ? attempts[0].date : null;
      
      return {
        ...student._doc,
        totalQuizzes,
        avgScore: avgScore.toFixed(2),
        lastAttempt
      };
    }));
    res.send(studentStats);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get overall analytics
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const attempts = await Attempt.find();
    const totalAttempts = attempts.length;
    const examStats = {};

    attempts.forEach(a => {
      if (!examStats[a.exam]) {
        examStats[a.exam] = { count: 0, totalScore: 0 };
      }
      examStats[a.exam].count++;
      examStats[a.exam].totalScore += (a.score / a.totalQuestions) * 100;
    });

    const analytics = Object.keys(examStats).map(exam => ({
      exam,
      avgScore: (examStats[exam].totalScore / examStats[exam].count).toFixed(2),
      totalAttempts: examStats[exam].count
    }));

    res.send({ totalAttempts, analytics });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add/Edit question
router.post('/questions', auth, adminAuth, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).send(question);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get admin stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAttempts = await Attempt.countDocuments();
    const attempts = await Attempt.find();
    const averageScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / attempts.length
      : 0;

    res.send({
      totalUsers,
      totalQuestions,
      totalAttempts,
      averageScore: averageScore.toFixed(2)
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all questions
router.get('/questions', auth, adminAuth, async (req, res) => {
  try {
    const questions = await Question.find();
    res.send(questions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all attempts
router.get('/attempts', auth, adminAuth, async (req, res) => {
  try {
    const attempts = await Attempt.find().populate('user', 'name email');
    const formattedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      userName: attempt.user.name,
      score: (attempt.score / attempt.totalQuestions * 100).toFixed(2),
      questionsAnswered: attempt.totalQuestions,
      date: attempt.date
    }));
    res.send(formattedAttempts);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all activities
router.get('/activities', auth, adminAuth, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email')
      .sort({ date: -1 })
      .limit(100);
    res.send(activities);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add new student
router.post('/students', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }
    const student = new User({
      name,
      email,
      password,
      role: 'student'
    });
    await student.save();
    res.status(201).send({ message: 'Student created successfully', student: { id: student._id, name: student.name, email: student.email } });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Delete student
router.delete('/students/:id', auth, adminAuth, async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    // Also delete their attempts
    await Attempt.deleteMany({ user: req.params.id });
    res.send({ message: 'Student and their data deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get student report
router.get('/students/:id/report', auth, adminAuth, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    const attempts = await Attempt.find({ user: student._id }).sort({ date: -1 });
    
    const report = {
      student,
      attempts,
      stats: {
        totalAttempts: attempts.length,
        averageScore: attempts.length > 0 
          ? (attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions), 0) / attempts.length) * 100 
          : 0,
        highestScore: attempts.length > 0
          ? Math.max(...attempts.map(a => (a.score / a.totalQuestions) * 100))
          : 0
      }
    };
    
    res.send(report);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Download student report as CSV
router.get('/students/:id/report/download', auth, adminAuth, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    const attempts = await Attempt.find({ user: student._id }).sort({ date: -1 });
    
    let csv = 'Exam,Date,Score,Total Questions,Percentage\n';
    attempts.forEach(a => {
      const percentage = ((a.score / a.totalQuestions) * 100).toFixed(2);
      csv += `"${a.exam}","${new Date(a.date).toLocaleDateString()}",${a.score},${a.totalQuestions},${percentage}%\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${student.name.replace(/\s+/g, '_')}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;

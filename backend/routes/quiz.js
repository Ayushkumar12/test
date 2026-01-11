const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { logActivity } = require('../utils/logger');
const { auth } = require('../middleware/authMiddleware');
const { checkAndAwardAchievements } = require('../utils/achievementHandler');
const { getSyllabus, generateQuestionsForTopic } = require('../utils/mistral');

// 1. Initial Load: Get syllabus + first 20 questions (2 topics)
router.get('/generate-ai/:exam', auth, async (req, res) => {
  try {
    const { exam } = req.params;

    // Get full syllabus
    const topics = await getSyllabus(exam);

    // Generate only first 2 topics (20 questions) for immediate start
    const initialTopics = topics.slice(0, 2);
    const questionPromises = initialTopics.map(topic =>
      generateQuestionsForTopic(topic, exam, 10)
    );

    const results = await Promise.all(questionPromises);
    const initialQuestions = results.flat().filter(q => q && q.question && Array.isArray(q.options));

    const questionsWithIds = initialQuestions.map((q, index) => ({
      ...q,
      _id: `ai_${index}_${Date.now()}`,
      correct_original: q.correct
    }));

    await logActivity(req.user._id, 'QUIZ_STARTED', `Started AI quiz (Initial): ${exam}`);

    res.json({
      questions: questionsWithIds,
      allTopics: topics, // Return syllabus so frontend can fetch rest
      exam
    });
  } catch (error) {
    console.error('Error in generate-ai route:', error);
    res.status(500).json({ error: 'Internal server error during AI quiz generation' });
  }
});

// 2. Background Load: Get remaining questions for the rest of topics
router.post('/generate-ai/remaining', auth, async (req, res) => {
  try {
    const { exam, topics, startIndex } = req.body;

    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({ error: 'Topics are required' });
    }

    const questionPromises = topics.map(topic =>
      generateQuestionsForTopic(topic, exam, 10)
    );

    const results = await Promise.all(questionPromises);
    const remainingQuestions = results.flat().filter(q => q && q.question && Array.isArray(q.options));

    const questionsWithIds = remainingQuestions.map((q, index) => ({
      ...q,
      _id: `ai_${(startIndex || 20) + index}_${Date.now()}`,
      correct_original: q.correct
    }));

    res.json({ questions: questionsWithIds });
  } catch (error) {
    console.error('Error in generate-ai-remaining route:', error);
    res.status(500).json({ error: 'Failed to generate remaining questions' });
  }
});

// Get 100 questions for an exam: 20 from each topic
router.get('/generate/:exam', auth, async (req, res) => {
  try {
    const { exam } = req.params;

    // Get all topics for the exam
    const topics = await Question.distinct('topic', { exam });

    let allQuestions = [];

    for (const topic of topics) {
      // Get up to 20 random questions per topic
      const topicQuestions = await Question.aggregate([
        { $match: { exam, topic } },
        { $sample: { size: 20 } }
      ]);
      allQuestions = allQuestions.concat(topicQuestions);
    }

    // If we have more than 100 questions, randomly select 100
    if (allQuestions.length > 100) {
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      allQuestions = shuffled.slice(0, 100);
    }

    await logActivity(req.user._id, 'QUIZ_STARTED', `Started quiz: ${exam}`);
    res.send(allQuestions);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).send({ error: error.message });
  }
});

// Submit quiz
router.post('/submit', auth, async (req, res) => {
  try {
    const { exam, responses, isAI } = req.body; // responses: [{ questionId, selectedOption, correctOption }]

    let score = 0;
    const detailedResponses = [];

    for (const resp of responses) {
      let isCorrect = false;
      if (isAI) {
        isCorrect = resp.correctOption === resp.selectedOption;
      } else {
        const question = await Question.findById(resp.questionId);
        if (question) {
          isCorrect = question.correct === resp.selectedOption;
        }
      }

      if (isCorrect) score++;

      detailedResponses.push({
        questionId: isAI ? null : resp.questionId,
        selectedOption: resp.selectedOption,
        isCorrect
      });
    }

    const attempt = new Attempt({
      user: req.user._id,
      exam: isAI ? `${exam} (AI)` : exam,
      score,
      totalQuestions: responses.length,
      responses: detailedResponses
    });

    await attempt.save();
    await logActivity(req.user._id, 'QUIZ_COMPLETED', `Completed quiz: ${exam}. Score: ${score}/${responses.length}`);

    // Check for new achievements
    const newlyEarned = await checkAndAwardAchievements(req.user._id);

    // Get updated user to return latest title/achievements
    const User = require('../models/User');
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(201).send({
      attempt,
      newAchievements: newlyEarned,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get user history
// Get user history
router.get('/history', auth, async (req, res) => {
  try {
    // Limit to last 50 attempts to prevent memory overflow
    const history = await Attempt.find({ user: req.user._id })
      .populate('responses.questionId')
      .sort({ date: -1 })
      .limit(50);
    res.send(history);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get user report
router.get('/report', auth, async (req, res) => {
  try {
    // Fetch all attempts but WITHOUT populating questions to save memory.
    const attempts = await Attempt.find({ user: req.user._id })
      .sort({ date: -1 });

    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions), 0) / attempts.length) * 100
        : 0,
      highestScore: attempts.length > 0
        ? Math.max(...attempts.map(a => (a.score / a.totalQuestions) * 100))
        : 0
    };

    res.send({
      student: {
        name: req.user.name,
        email: req.user.email,
        title: req.user.title,
        achievements: req.user.achievements
      },
      attempts,
      stats
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;

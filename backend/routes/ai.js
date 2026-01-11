const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth } = require('../middleware/authMiddleware');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Question = require('../models/Question');
const { checkAndAwardAchievements } = require('../utils/achievementHandler');
const { generatePencilDrawing } = require('../utils/aiImage');
const { uploadImage } = require('../utils/cloudinary');
const { generateWithRetry } = require('../utils/geminiRetry');

router.post('/career-insight', auth, async (req, res) => {
  try {
    const { attemptId } = req.body;
    const attempt = await Attempt.findById(attemptId).populate('responses.questionId');

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Group correct/incorrect by topic
    const topicPerformance = {};
    attempt.responses.forEach(resp => {
      const topic = resp.questionId?.topic || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      topicPerformance[topic].total++;
      if (resp.isCorrect) {
        topicPerformance[topic].correct++;
      }
    });

    const performanceSummary = Object.entries(topicPerformance)
      .map(([topic, stats]) => `${topic}: ${stats.correct}/${stats.total}`)
      .join(', ');

    const prompt = `As an expert medical career counselor, analyze this student's exam performance:
    Exam: ${attempt.exam}
    Total Score: ${attempt.score}/${attempt.totalQuestions}
    Topic-wise Performance: ${performanceSummary}
    
    Provide a professional AI Career Insight (max 2-3 sentences).
    1. Identify a potential healthcare specialization they might excel in based on their strong topics.
    2. Provide one specific, actionable advice for their career or study path.
    Keep the tone encouraging, professional, and clear. Do not use any markdown formatting like bold or tables, just plain text.`;

    const result = await generateWithRetry(prompt);
    const insight = result.response.text();

    res.json({ insight });
  } catch (error) {
    console.error('Career Insight Error:', error);
    res.status(500).json({ error: 'Failed to generate career insight' });
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch user details
    const user = await User.findById(userId);

    // Fetch previous exam attempts
    const attempts = await Attempt.find({ user: userId }).sort({ date: -1 }).limit(5);

    const performanceSummary = attempts.length > 0
      ? attempts.map(a => `- Exam: ${a.exam}, Score: ${a.score}/${a.totalQuestions}, Date: ${new Date(a.date).toLocaleDateString()}`).join('\n')
      : 'No exams taken yet.';

    // Fetch chat history
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = new Chat({ user: userId, messages: [] });
    }


    const systemInstruction = `You are a professional medical assistant and educator for healthcare students. 
Your goal is to provide accurate, helpful, and encouraging information about medical topics, healthcare practices, and exam preparation. 
Always maintain a professional tone and emphasize patient safety and evidence-based practice.

Student Information:
- Name: ${user.name}
- Current Focus: Medic-grow Exam Preparation
- Recent Exam Performance:
${performanceSummary}

Rules for your responses:
1. Keep the language simple, short, clear, and encouraging.
2. Use small paragraphs (2-3 sentences max) to avoid large blocks of text.
3. Use **Text** for bolding important medical terms or key points.
4. Use ### for next line spacing between different sections or key points.
5. Use bullet points or numbered lists for better readability.
6. DO NOT use table formats.
7. Show only what the student asked for to ensure simple understanding.
8. ONLY show or discuss the "Recent Exam Performance" if the student explicitly asks about their results, performance, or scores.
9. If you believe a visual representation (like a diagram or a clinical drawing) would help the student understand a medical concept better, include a tag at the end exactly like this: [GENERATE_IMAGE: descriptive prompt for the drawing].

When the student asks about their results or performance:
1. Provide a short, easy-to-understand summary of the performance data provided above.
2. Highlight their strengths and areas for improvement.
3. If they haven't taken any exams, encourage them to start a practice test.

Personalize your responses using the student's name. If a question is outside the medical scope, politely redirect them.`;

    // Prepare history for Gemini
    const history = chat.messages.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chatParams = {
      history: history,
      message: `System Instruction: ${systemInstruction}\n\nUser Message: ${message}`,
      generationConfig: {
        maxOutputTokens: 1000,
      }
    };

    const result = await generateWithRetry(chatParams, {}, true);
    let reply = result.response.text();

    // Handle image generation if requested by AI
    let imageUrl = null;
    const imageTagMatch = reply.match(/\[GENERATE_IMAGE: (.*?)\]/);
    if (imageTagMatch) {
      try {
        const imagePrompt = imageTagMatch[1];
        const generatedUrl = await generatePencilDrawing(imagePrompt);
        imageUrl = await uploadImage(generatedUrl);
        // Remove the tag from the reply
        reply = reply.replace(/\[GENERATE_IMAGE: (.*?)\]/, '').trim();
      } catch (imgError) {
        console.error('Image generation/upload failed:', imgError);
        // We still want to send the text reply even if image fails
        reply = reply.replace(/\[GENERATE_IMAGE: (.*?)\]/, '').trim();
      }
    }

    // Update chat history in DB
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: reply, imageUrl });

    // Limit history to last 50 messages to prevent unbounded growth
    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    chat.updatedAt = Date.now();
    await chat.save();

    // Update user chatbot usage count and check achievements
    user.chatbotUsageCount = (user.chatbotUsageCount || 0) + 1;
    await user.save();
    const newAchievements = await checkAndAwardAchievements(userId);

    // Get updated user to return latest title/achievements
    const updatedUser = await User.findById(userId).select('-password');

    res.json({ reply, imageUrl, newAchievements, user: updatedUser });
  } catch (error) {
    console.error('Gemini AI Chat Error:', error);

    // Check for specific API key suspension or invalid key errors
    if (error.status === 403 || error.message?.includes('403') || error.message?.includes('suspended')) {
      return res.status(403).json({
        error: 'AI service is currently unavailable due to API key suspension. Please check your GEMINI_API_KEY configuration.'
      });
    }

    res.status(500).json({ error: 'Failed to get response from AI assistant' });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user.id });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;

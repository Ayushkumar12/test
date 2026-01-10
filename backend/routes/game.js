const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const { generateWithRetry } = require('../utils/geminiRetry');

const SYSTEM_PROMPT = `You are a professional nursing clinical educator. You are running a 5-step story-based simulation for a nursing student.
Your goal is to present a realistic clinical scenario where the student must make critical decisions over exactly 5 steps.

Guidelines:
1. The simulation MUST consist of exactly 5 steps.
2. In each step, the patient's vital signs and condition MUST change significantly based on the student's previous action (improving for correct actions, worsening for incorrect ones).
3. Provide 4 realistic multiple-choice options for the next action in each step.
4. One option is the "best" practice, others are less ideal or dangerous.
5. Provide detailed clinical feedback on the previous choice at each step.
6. Track the current step number (1 to 5).
7. On Step 5, set "gameOver" to true and provide a final summary of the patient's outcome based on all previous choices.
8. The patient's vital signs must reflect their current status accurately (e.g., tachycardia/hypotension if worsening).
9. The "conditionChange" field should be one of: "Improved", "Worsened", "Stabilized", or "N/A" (for step 1).

You MUST respond in JSON format with the following structure:
{
  "step": 1,
  "scenario": "Detailed description of the current situation",
  "options": [
    {"id": 1, "text": "Action 1 description"},
    {"id": 2, "text": "Action 2 description"},
    {"id": 3, "text": "Action 3 description"},
    {"id": 4, "text": "Action 4 description"}
  ],
  "patientStatus": "Current status (Stable, Guarded, Critical, Improving, Deteriorating)",
  "conditionChange": "Improved/Worsened/Stabilized",
  "feedback": "Clinical feedback on the previous choice",
  "gameOver": false,
  "success": false,
  "vitalSigns": {
    "bp": "120/80",
    "hr": "80",
    "rr": "18",
    "temp": "98.6",
    "spo2": "98%"
  }
}`;

router.post('/start', auth, async (req, res) => {
    try {
        const prompt = `${SYSTEM_PROMPT}\n\nStart Step 1 of a new nursing clinical scenario. Choose a random but common nursing situation (e.g., post-op complication, chest pain, respiratory distress, etc.).`;
        const result = await generateWithRetry(prompt, { responseMimeType: "application/json" });
        const response = JSON.parse(result.response.text());
        
        await logActivity(req.user.id, 'GAME_STARTED', `Started new nursing simulation: ${response.scenario.substring(0, 100)}...`);
        
        res.json(response);
    } catch (error) {
        console.error('Game Start Error:', error);
        res.status(500).json({ error: 'Failed to start the game. All API keys may have exceeded their quota.' });
    }
});

router.post('/action', auth, async (req, res) => {
    try {
        const { history, lastAction } = req.body;
        const currentStep = history.length + 1;
        
        const prompt = `${SYSTEM_PROMPT}
        
        Game History:
        ${JSON.stringify(history)}
        
        Current Step: ${currentStep}
        The student just chose: ${lastAction}
        
        Based on this choice and previous history, continue the story for Step ${currentStep}. 
        If this is Step 5, conclude the case and set gameOver to true.
        Provide specific feedback on how the last action affected the patient's vitals and condition.`;

        const result = await generateWithRetry(prompt, { responseMimeType: "application/json" });
        const response = JSON.parse(result.response.text());

        if (response.gameOver) {
            const summary = `Completed nursing simulation. Final Status: ${response.patientStatus}. Success: ${response.success}. Steps: ${response.step || currentStep}`;
            await logActivity(req.user.id, 'GAME_COMPLETED', summary);
            
            // Update user stats
            const User = require('../models/User');
            const { checkAndAwardAchievements } = require('../utils/achievementHandler');
            
            const user = await User.findById(req.user.id);
            if (user) {
                user.storyGamesCompleted = (user.storyGamesCompleted || 0) + 1;
                if (response.success) {
                    user.successfulSimulations = (user.successfulSimulations || 0) + 1;
                    if (response.patientStatus === 'Critical' || history.some(h => h.patientStatus === 'Critical')) {
                        user.criticalSimsResolved = (user.criticalSimsResolved || 0) + 1;
                    }
                } else {
                    user.failedSimulations = (user.failedSimulations || 0) + 1;
                }
                await user.save();
                
                // Check for achievements
                const newlyEarned = await checkAndAwardAchievements(req.user.id, {
                    gameSuccess: response.success,
                    finalStatus: response.patientStatus,
                    conditionChange: response.conditionChange,
                    gameOver: response.gameOver,
                    initialStatus: history[0]?.patientStatus,
                    allStepsImproved: history.every(h => h.conditionChange === 'Improved') && response.conditionChange === 'Improved',
                    lastAction: lastAction,
                    vitals: response.vitalSigns
                });
                // We add newlyEarned to response so frontend can show them if needed
                response.newAchievements = newlyEarned;
                // Add updated user data
                const updatedUser = await User.findById(req.user.id).select('-password');
                response.user = updatedUser;
            }
        } else {
            await logActivity(req.user.id, 'GAME_STEP', `Completed step ${response.step || currentStep}. Choice: ${lastAction}. Patient Status: ${response.patientStatus}`);
        }

        res.json(response);
    } catch (error) {
        console.error('Game Action Error:', error);
        res.status(500).json({ error: 'Failed to process game action' });
    }
});

module.exports = router;
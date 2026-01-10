const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gets all available Gemini API keys from environment variables.
 * Includes base keys and numbered keys (1-20).
 */
const getAllKeys = () => {
    const keys = [];
    
    // Add specific game keys first if available
    if (process.env.GEMINI_GAME_API_KEY) keys.push(process.env.GEMINI_GAME_API_KEY.trim());

    // Add numbered keys GEMINI_GAME_API_KEY_1 to GEMINI_GAME_API_KEY_20
    for (let i = 1; i <= 20; i++) {
        const key = process.env[`GEMINI_GAME_API_KEY_${i}`];
        if (key) {
            const trimmedKey = key.trim();
            if (!keys.includes(trimmedKey)) {
                keys.push(trimmedKey);
            }
        }
    }

    // Add base GEMINI_API_KEY if not already included
    if (process.env.GEMINI_API_KEY) {
        const trimmedKey = process.env.GEMINI_API_KEY.trim();
        if (!keys.includes(trimmedKey)) {
            keys.push(trimmedKey);
        }
    }
    
    return keys;
};

/**
 * Executes a Gemini AI content generation with retry and key rotation logic.
 * @param {string|object} promptOrChat - The prompt string or a chat session configuration
 * @param {object} options - Configuration for the model
 * @param {boolean} isChat - Whether this is a chat session
 */
const generateWithRetry = async (promptOrChat, options = {}, isChat = false) => {
    let keys = getAllKeys();
    if (keys.length === 0) throw new Error('No Gemini API keys found in environment variables');

    // Shuffle keys to distribute load initially
    keys = keys.sort(() => Math.random() - 0.5);

    let lastError = null;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ 
                model: options.model || "gemini-flash-latest",
                generationConfig: options.generationConfig || {
                    responseMimeType: options.responseMimeType || "text/plain",
                }
            });
            
            if (isChat) {
                // For chat, we return the model and the caller handles sendMessage
                // But to truly retry on 429 during sendMessage, we need a different approach
                // For simplicity in this project, we'll focus on the content generation retry
                const chat = model.startChat({
                    history: promptOrChat.history,
                    generationConfig: promptOrChat.generationConfig,
                });
                return await chat.sendMessage(promptOrChat.message);
            } else {
                return await model.generateContent(promptOrChat);
            }
        } catch (error) {
            lastError = error;
            // If it's a quota error (429) or forbidden (403/suspended), try the next key
            const isQuotaError = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');
            const isSuspended = error.status === 403 || error.message?.includes('403') || error.message?.includes('suspended');
            
            if (isQuotaError || isSuspended) {
                console.warn(`Gemini API key ${i + 1}/${keys.length} failed (${error.status || 'Error'}), rotating...`);
                continue;
            }
            // For other errors, throw immediately
            throw error;
        }
    }
    
    throw lastError || new Error('All Gemini API keys failed');
};

module.exports = {
    getAllKeys,
    generateWithRetry
};

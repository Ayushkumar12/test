const axios = require('axios');

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

const generateWithMistral = async (prompt) => {
  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small-latest', 
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral AI Error:', error.response?.data || error.message);
    throw error; // Throw the original error for better debugging
  }
};

const getSyllabus = async (exam) => {
  try {
    const prompt = `Provide a list of 10 core topics for the ${exam} nursing exam. 
    Return the response as a JSON object with a "topics" field which is an array of strings. 
    Example: {"topics": ["Anatomy", "Pharmacology", "Medical-Surgical Nursing", "Pediatric Nursing", "Obstetric Nursing", "Psychiatric Nursing", "Community Health", "Nutrition", "Fundamentals of Nursing", "Microbiology"]}
    Ensure the topics cover the entire syllabus.`;

    const result = await generateWithMistral(prompt);
    const parsed = JSON.parse(result);
    if (!parsed.topics || !Array.isArray(parsed.topics)) {
        throw new Error('Invalid syllabus format from AI');
    }
    return parsed.topics;
  } catch (error) {
    console.error('Syllabus Generation Error:', error);
    // Fallback topics in case AI fails
    return [
        "Anatomy and Physiology", "Pharmacology", "Medical-Surgical Nursing", 
        "Pediatric Nursing", "Obstetric and Gynecological Nursing", 
        "Psychiatric Nursing", "Community Health Nursing", "Nutrition", 
        "Fundamentals of Nursing", "Microbiology"
    ];
  }
};

const generateQuestionsForTopic = async (topic, exam, count = 10) => {
  try {
    const prompt = `Generate ${count} multiple-choice questions for the topic "${topic}" in the context of the ${exam} nursing exam.
    Return the response as a JSON object with a "questions" field which is an array of objects.
    Each object MUST have:
    - "question": string
    - "options": array of exactly 4 strings
    - "correct": number (0-3)
    - "explanation": string
    - "topic": "${topic}"
    - "exam": "${exam}"

    JSON format example:
    {
      "questions": [
        {
          "question": "Example?",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "explanation": "Because...",
          "topic": "${topic}",
          "exam": "${exam}"
        }
      ]
    }`;

    const result = await generateWithMistral(prompt);
    const parsed = JSON.parse(result);
    return parsed.questions || [];
  } catch (error) {
    console.error(`Question Generation Error for topic ${topic}:`, error);
    return []; // Return empty array so Promise.all doesn't fail the whole quiz
  }
};

module.exports = {
  getSyllabus,
  generateQuestionsForTopic
};

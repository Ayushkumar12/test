/**
 * Generates a pencil-drawn image using Pollinations.ai.
 * @param {string} prompt - The description of what to draw.
 * @returns {Promise<string>} - The URL of the generated image.
 */
const generatePencilDrawing = async (prompt) => {
  try {
    const enhancedPrompt = `A clear, educational, and labelled pencil-drawn illustration of: ${prompt}. 
    Style: Simple, clean, clinical pencil sketch on white background.
    Details: High contrast, professional medical illustration, no colors, 
    highly detailed for nursing students to understand medical concepts clearly.`;

    // Encode the prompt for use in the URL
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Pollinations.ai returns the image directly at this URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&enhance=false`;

    return imageUrl;
  } catch (error) {
    console.error('Pollinations Image Generation Error:', error);
    throw error;
  }
};

module.exports = { generatePencilDrawing };

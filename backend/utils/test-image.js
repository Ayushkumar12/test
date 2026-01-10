require('dotenv').config({ path: '../.env' });
const { generatePencilDrawing } = require('./aiImage');

async function test() {
  try {
    console.log('Testing image generation...');
    const url = await generatePencilDrawing('a simple human heart diagram');
    console.log('Success! Image data length:', url.length);
    console.log('Start of data:', url.substring(0, 50));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();

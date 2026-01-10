const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  exam: { type: String, required: true }, // e.g., ESIC, NORCET
  topic: { type: String, required: true },
  question: { type: String, required: true },
  questionKey: { type: String, required: false }, // Unique identifier for the question
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true }, // Index of the correct option (answer key)
  explanation: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema);

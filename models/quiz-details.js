const mongoose = require("mongoose");
const { Schema } = mongoose;

const quizDetailsSchema = Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correct_answer: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = quizDetailsSchema;

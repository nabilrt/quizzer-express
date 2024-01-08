const mongoose = require("mongoose");
const { Schema } = mongoose;
const quizDetailsSchema = require("./quiz-details");

const quizSchema = Schema({
  language_id: {
    type: Schema.Types.ObjectId,
    ref: "Language",
  },
  title: {
    type: String,
    required: true,
  },
  details: [quizDetailsSchema],
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;

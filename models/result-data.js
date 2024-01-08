const mongoose = require("mongoose");
const { Schema } = mongoose;
const quizDetailsSchema = require("./quiz-details");

const resultDataSchema = Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  language_id: {
    type: Schema.Types.ObjectId,
    ref: "Language",
  },
  quiz_id: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
  },
  score: {
    type: Number,
    required: true,
  },
  user_answers: [quizDetailsSchema],
});

const ResultData = mongoose.model("ResultData", resultDataSchema);

module.exports = ResultData;

const express = require("express");
const upload = require("../middlewares/file-upload");
const Quiz = require("../models/quiz");
const adminauth = require("../middlewares/admin-auth");
const all_user_auth = require("../middlewares/all-access-auth");

const quizRouter = express.Router();

//Add Quiz
quizRouter.post("/add-quiz", adminauth, async (req, res) => {
  try {
    const { language_id, title, details } = req.body;
    const quiz = await Quiz.create({
      language_id,
      title,
      details,
    });
    const quizz = await quiz.save();
    return res.status(201).json({
      message: "Quiz Created",
      quiz: quizz,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Find Quiz by Language
quizRouter.get("/get-quizzes/:id", all_user_auth, async (req, res) => {
  try {
    const quiz = await Quiz.find({ language_id: req.params.id });
    return res.status(200).json({
      message: "Quiz Found",
      quiz,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Find Quiz by ID
quizRouter.get("/get-quiz/:id", all_user_auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    return res.status(200).json({
      message: "Quiz Found",
      quiz,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Modify Quiz
quizRouter.put("/update-quiz/:id", adminauth, async (req, res) => {
  try {
    const { title, details } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      quiz.title = title;
      quiz.details = details;
      const quizz = await quiz.save();
      return res.status(201).json({
        message: "Quiz Updated",
        quiz: quizz,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Delete Quiz
quizRouter.delete("/delete-quiz/:id", adminauth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      await quiz.remove();
      return res.status(201).json({
        message: "Quiz Deleted",
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = quizRouter;

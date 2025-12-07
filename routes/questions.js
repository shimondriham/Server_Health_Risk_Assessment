const express = require("express");
const router = express.Router();
const { QuestionModel } = require("../models/questionsModel");
const { auth } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/userModel");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.json({ msg: "Work from questions.js" });
});

// get all questions of the logged in user
router.get("/myInfo", auth, async (req, res, next) => {
  try {
    let token_id = req.tokenData._id;
    let user = await QuestionModel.find({ userId: token_id });
    if (!user) {
      return res.status(404).json({ error: "Questions not found" });
    }
    console.log(user);
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Get the question by ID
router.put("/thisQuestion", auth, async (req, res, next) => {
  try {
    let questionId = req.body.idQuestions;
    console.log(req.body);
    
    let question = await QuestionModel.findOne({ _id: questionId });
    console.log(question);
    if (!question) {
      return res.json("Question not found" );
    }
    console.log(question);
    res.json(question);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});




router.post("/", auth, async (req, res) => {
  if (req.body.section == 'Safety First') {
    try {
      let token = req.header("x-api-key");
      let decodeToken = jwt.verify(token, process.env.JWT_SECRET);
      let user_id = decodeToken._id;
      let question = new QuestionModel();
      question.userId = user_id;
      question.section = req.body.section;
      let answers = req.body.answers;
      for (let i = 0; i < answers.length; i++) {
        question[answers[i].id] = answers[i].answer;
      }
      await question.save();
      return res.status(201).json(question);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  } else {
    return res.status(400).json({ error: "Invalid section" });
  }

});

router.put("/edit", auth, async (req, res) => {
  if (req.body.section == 'Safety First') {
    return res.status(400).json({ error: "Invalid section" });
  }
  try {
    let questions = await QuestionModel.findOne({ _id: req.body.idQuestions });
    if (!questions) {
      return res.status(400).json({ error: "Questions not found" });
    }
    for (let i = 0; i < req.body.answers.length; i++) {
      let answer = req.body.answers[i];
      questions[answer.id] = answer.answer;
    }
    questions.section = req.body.section;
    if (req.body.section === 'Your Goals') {
      questions.finishedT1 = true;
      questions.finished = true;
    }
    let data = await QuestionModel.updateOne({ _id: req.body.idQuestions }, questions);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }

})



module.exports = router;

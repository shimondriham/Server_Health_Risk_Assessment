const express = require("express");
const router = express.Router();
const { QuestionModel } = require("../models/questionsModel");
const { auth } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/userModel");
const { askAiForAnalysis, askAi } = require("../middlewares/sendToOpenAi");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.json({ msg: "Work from questions.js" });
});


router.put("/gpt", async (req, res, next) => {
  let ar = req.body.ar;
  console.log("ar:", ar);
  let id = req.body.id;
  try {
    let gpt = await askAiForAnalysis(ar);
    console.log(gpt);
    let Questions = await QuestionModel.find({ _id: id });
    if (!Questions) {
      return res.status(404).json({ error: "Questions not found" });
    }
    Questions.cardio_readiness[0] = gpt.cards[id==cardio_readiness].status_label;
    Questions.cardio_readiness[1] = gpt.cards[id==cardio_readiness].summary;
    
    Questions.functional_strength[0] = gpt.cards[2].status_label;
    Questions.functional_strength[1] = gpt.cards[2].summary;

    Questions.balance_fall_risk[0] = gpt.cards[3].status_label;
    Questions.balance_fall_risk[1] = gpt.cards[3].summary;

    Questions.mobility_pain[0] = gpt.cards[1].status_label;
    Questions.mobility_pain[1] = gpt.cards[1].summary;

    console.log("Questions to update:", Questions);

    let data = await QuestionModel.updateOne({ _id: id }, Questions);
    console.log(data);
    console.log(Questions);
    res.json(data);
    res.json(gpt);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
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

// Get all questions from the selected user
router.get("/selectedUser/:id", auth, async (req, res, next) => {
  let ThisUser = req.params.id;
  try {
    let Questions = await QuestionModel.find({ userId: ThisUser });
    if (!Questions) {
      return res.status(404).json({ error: "Questions not found" });
    }
    console.log(Questions);
    res.json(Questions);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Get all the details of the selected Questions object
router.get("/selectedQuestions/:id", auth, async (req, res, next) => {
  let ThisQuestions = req.params.id;
  try {
    let Questions = await QuestionModel.findOne({ _id: ThisQuestions });
    if (!Questions) {
      return res.status(404).json({ error: "No questions found for this user" });
    }
    console.log(Questions);
    res.json(Questions);
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
      return res.json("Question not found");
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

    if (req.body.section == "Your Active Life" || req.body.section == "How You Feel Day to Day" || req.body.section == 'Your Goals') {
      for (let i = 0; i < req.body.answers.length; i++) {
        let answer = req.body.answers[i];
        questions[answer.id] = answer.answer;
      }
      questions.section = req.body.section;

      if (req.body.section === 'Your Goals') {
        questions.finishedT1 = true;

      }
    }
    if (req.body.section == "bio section") {
      console.log("aaaa");
      console.log(req.body.resultsData);

      questions.Chair_Stand = req.body.resultsData.Chair_Stand;
      questions.Comfortable_Stand = req.body.resultsData.Comfortable_Stand;
      questions.Weight_Shift[0] = req.body.resultsData.Weight_Shift.right;
      questions.Weight_Shift[1] = req.body.resultsData.Weight_Shift.left;
      questions.Forward_Reach = req.body.resultsData.Forward_Reach;
      questions.Arm_Raise = req.body.resultsData.Arm_Raise;
      questions.Seated_Trunk_Turn[0] = req.body.resultsData.Seated_Trunk_Turn.right;
      questions.Seated_Trunk_Turn[1] = req.body.resultsData.Seated_Trunk_Turn.left;

      questions.finished = true;
      // askAiForAnalysis()
    }
    let data = await QuestionModel.updateOne({ _id: req.body.idQuestions }, questions);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
})



module.exports = router;

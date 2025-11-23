const express = require("express");
const router = express.Router();
const { QuestionModel } = require("../models/questionsModel");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.json({ msg: "Work from questions.js" });
});

router.post("/", async (req, res, next) => {
  try {
    const { section, answers } = req.body;

    // בדיקות בסיסיות
    if (!section || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload: section and answers are required" });
    }

    if (answers.length !== 28) {
      return res.status(400).json({ error: `Expected 28 answers, received ${answers.length}` });
    }

    // בדיקת מבנה כל תשובה
    for (const a of answers) {
      if (typeof a !== "object" || typeof a.id === "undefined" || typeof a.answer === "undefined") {
        return res.status(400).json({ error: "Each answer must be an object with 'id' and 'answer' fields" });
      }
    }

    // שמירה למסד
    const doc = new QuestionModel({
      section,
      answers,
      createdAt: new Date(),
    });

    await doc.save();

    return res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


// {
//   "section": 'Safety First',
//   "answers": [
//     { id: 1, answer: 'Yes'
//     },
//     { id: 2, answer: []
//     }
//   ]
// }

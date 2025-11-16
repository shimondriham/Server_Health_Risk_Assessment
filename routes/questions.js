const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.json({ msg: "Work from questions.js" });
});

module.exports = router;

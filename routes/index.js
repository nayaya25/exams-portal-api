const express = require("express");
const router = express.Router();

const {
  verify,
  createQuestions,
  getQuestions,
  increaseTestAttempt,
  gradeApplicant,
  createSubject,
  getSubjects,
  getSubjectQuestions,
  getSubjectQuestionsByCategory,
  uploadQuestionCsv,
} = require("../controllers");

const {
  validate,
  questionCreateValidationRules,
  nasimsIdValidationRule,
} = require("../middlewares");

router.get("/increaseLogin", increaseTestAttempt);
router.get("/verify", nasimsIdValidationRule(), validate, verify);
router.get("/questions", getQuestions);
router.post("/questions", createQuestions);
router.post("/gradeApplicant", gradeApplicant);
router.post("/subjects", createSubject);
router.get("/subjects", getSubjects);
router.get("/subject-questions", getSubjectQuestions);
router.post("/csv-questions", uploadQuestionCsv);

router.all("/*", (req, res) => {
  res.status(404).json("You are probably Lost..... Check your route!");
});

module.exports = router;

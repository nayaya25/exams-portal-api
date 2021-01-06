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
  uploadQuestionCsv,
} = require("../controllers/index");

const {
  newAdmin,
  passwordReset,
  newPassword,
  login,
  retakeTest,
  ApplicantScores,
} = require("../controllers/admin");

const { validate, rulesFor, verifyToken } = require("../middlewares");

router.get("/increaseLogin", increaseTestAttempt);
router.get("/verify", rulesFor("verify"), validate, verify);
router.get("/questions", getQuestions);
router.post("/questions", createQuestions);
router.post("/gradeApplicant", gradeApplicant);
router.post("/subjects", createSubject);
router.get("/subjects", getSubjects);
router.get("/subject-questions", getSubjectQuestions);
router.post("/csv-questions", uploadQuestionCsv);

router.post("/admin/newAdmin", verifyToken, newAdmin);
router.post("/admin/passwordReset", passwordReset);
router.post("/admin/newPassword/:activation_code", newPassword);
router.post("/admin/login", login);
router.post("/admin/retakeTest", verifyToken, retakeTest);
router.get("/admin/applicantScores", ApplicantScores);

router.all("/*", (req, res) => {
  res.status(404).json("You are probably Lost..... Check your route!");
});

module.exports = router;

const express = require("express");
const router = express.Router();

const {
    verify,
    createQuestions,
    getQuestions,
    increaseTestAttempt,
    gradeApplicant,
    createSubject
} = require("../controllers/index");

const {
  newAdmin,
  passwordReset,
  newPassword,
  login
} = require("../controllers/admin");


const {
  validate,
  questionCreateValidationRules,
  nasimsIdValidationRule,
  verifyToken
  
} = require("../middlewares");

router.get("/increaseLogin", increaseTestAttempt);
router.get("/verify", nasimsIdValidationRule(), validate, verify);
router.get("/questions", getQuestions);
router.post("/questions", createQuestions);
router.post("/gradeApplicant", gradeApplicant);
router.post("/subjects", createSubject);
router.post("/admin/newAdmin",verifyToken, newAdmin);
router.post("/admin/passwordReset", passwordReset);
router.post("/admin/newPassword", newPassword);
router.post("/admin/login", login);



router.all("/*", (req, res) => {
  res.status(404).json("You are probably Lost..... Check your route!");
});

module.exports = router;

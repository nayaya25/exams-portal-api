const express = require("express");
const router = express.Router();

const {
    verify,
    createQuestion,
    getQuestions,
    increaseTestAttempt,
    gradeApplicant
} = require("../controllers");

const {
    validate,
    questionCreateValidationRules,
    nasimsIdValidationRules
} = require("../middlewares");



router.get('/increaseLogin', increaseTestAttempt);
router.get('/verify', nasimsIdValidationRules(), validate, verify);
router.get('/questions', getQuestions);
router.post('/questions', questionCreateValidationRules(), validate, createQuestion);
router.post('/gradeApplicant', gradeApplicant);

router.all('/*', (req, res) => {
    res.status(404).json("You are probably Lost..... Check your route!");
});

module.exports = router;
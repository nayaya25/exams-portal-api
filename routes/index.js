const express = require("express");
const router = express.Router();

const {
    verify,
    createQuestions,
    getQuestions,
    increaseTestAttempt,
    gradeApplicant
} = require("../controllers");

const {
    validate,
    questionCreateValidationRules,
    nasimsIdValidationRule,
    testSubmitValidationRules
} = require("../middlewares");



router.get('/increaseLogin', increaseTestAttempt);
router.get('/verify', nasimsIdValidationRule(), validate, verify);
router.get('/questions', getQuestions);
router.post('/questions', questionCreateValidationRules(), validate, createQuestions);
router.post('/gradeApplicant', testSubmitValidationRules(), validate, gradeApplicant);

router.all('/*', (req, res) => {
    res.status(404).json("You are probably Lost..... Check your route!");
});

module.exports = router;
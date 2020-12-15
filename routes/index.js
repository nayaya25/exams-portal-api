const express = require("express");
const router = express.Router();

const {
    verify,
    createQuestion,
    // getQuestions,
    increaseTestAttempt
} = require("../controllers");

const {
    validate,
    questionCreateValidationRules,
    nasimsIdValidationRules
} = require("../middlewares");

// router.get('/questions', getQuestions);

router.get('/increaseLogin', increaseTestAttempt);
router.get('/verify', nasimsIdValidationRules(), validate, verify);
router.post('/question', questionCreateValidationRules(), validate, createQuestion);

router.all('/*', (req, res) => {
    res.status(404).json("You are probably Lost..... Check your route!");
});

module.exports = router;
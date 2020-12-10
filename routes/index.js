const express = require("express")
const { verify, createQuestion, getQuestions } = require("../controllers")
const router = express.Router()

const {
    validate,
    questionCreateValidationRules,
    nasimsIdValidationRules
} = require("../middlewares")

// router.get('/questions', getQuestions)
router.get('/verify', nasimsIdValidationRules(), validate, verify)
router.post('/question', questionCreateValidationRules(), validate, createQuestion)
module.exports = router;
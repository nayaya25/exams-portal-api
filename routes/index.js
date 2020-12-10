const express = require("express")
const { verify, createQuestion,examQuestions,examScore } = require("../controllers")
const router = express.Router()

const {
    validate,
    questionCreateValidationRules,
    nasimsIdValidationRules
} = require("../middlewares")

router.get('/verify', nasimsIdValidationRules(), validate, verify)
router.post('/question', questionCreateValidationRules(), validate, createQuestion)
router.get('/exam',examQuestions)
router.post('/examScore', examScore)
module.exports = router;
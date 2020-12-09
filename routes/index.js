const express = require("express")
const { verify, createQuestion } = require("../controllers")
const router = express.Router()

const {
    validate,
    questionCreateValidationRules,
    nasimsIdValidationRules
} = require("../middlewares")

router.get('/verify', nasimsIdValidationRules(), validate, verify)
router.post('/question', questionCreateValidationRules(), validate, createQuestion)
module.exports = router;
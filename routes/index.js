const express = require("express")
const { verify, createQuestion } = require("../controllers")
const router = express.Router()

const {validate, questionCreateRules } = require("../middlewares")

router.get('/login', verify)
router.post('/question', questionCreateRules(), validate, createQuestion)
module.exports = router;
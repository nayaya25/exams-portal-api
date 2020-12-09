const express = require("express")
const { verify, createQuestion } = require("../controllers")
const router = express.Router()



router.get('/login', verify)
router.post('/question', createQuestion)
module.exports = router;
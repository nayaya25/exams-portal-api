const superagent = require("superagent");
const { DESK_API_KEY, DESK_API_SECRET, API_URL } = require("../helpers/constants");
const { Question } = require("../models")
const { dbErrorFormatter } = require("../helpers/utils")

const verify = async (req, res) => {
    const { nasimsId } = req.query;

    try {
        const url = `${API_URL}/api/resource/Applicants?fields=["application_id","programme","name"]&filters=[["name","=","${nasimsId}"]]`;
        const response = await superagent
            .get(url)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Token ${DESK_API_KEY}:${DESK_API_SECRET}`);
        
        const data = JSON.parse(response.text).data;
        const resObj = Array.isArray(data) && !data.length ?
            { 'status': 'invalid', 'message': `${nasimsId} Not Found In Our Records`}
            :
            { 'status': 'success', 'message': 'Verification Successful', 'data': data }
        
        return res.status(200).json(resObj)
    } catch (err) {
        return res.status(422).json({ 'status': err.status, 'message': `Verification for ${nasimsId} Failed!`, 'errorDetails': err });
    }
}

const createQuestion = async (req, res) => {
    const { questions } = req.body;
    const errorMessages = []
    questions.forEach((questionObject, index) => {
        const answerIndex = questionObject.options.indexOf(questionObject.answer);
        if (answerIndex === -1) {
            errorMessages.push({ questionIndex: index, message: 'Answer not Part of the Options Array' })
        } else {
            questionObject.answer = answerIndex;
        }
    })

    try {
        const areValidAnswers = questions.every(q => q.answer > -1)
        if (!areValidAnswers) {
            res.status(406).json({ 'status': 'Invalid Answer Error', 'errorInfo': errorMessages})
        } else {
            const newQuestions = await Question.bulkCreate(questions)
            res.status(201).json(newQuestions)
        }
  } catch (e) {
        res.status(503).json({
            'status': 'Database Error',
            'errorDetails': dbErrorFormatter(e)
        })
    }
}

// const getQuestions = async (req, res) => {
//     try {
//         const questions = await Question.findAll({
//           attributes: [
//                 'id',
//                 'question',
//                 'options',
//                 'time'
//             ]
//         })
//         res.status(200).json({status: 'success', data: questions})
//     } catch (error) {
//         res.status(503).json({ status: 'error', message: 'Error Fetching Questions'})
//     }
// }

module.exports = {
    verify,
    createQuestion,
    // getQuestions
}
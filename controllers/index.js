const superagent = require("superagent");
const { DESK_API_KEY, DESK_API_SECRET, API_URL } = require("../helpers/constants");
const { Question } = require("../models")

const verify = async (req, res) => {
    const { nasimsId } = req.query;

    try {
        const url = `${API_URL}/api/resource/Applicants?fields=["application_id","programme","name"]&filters=[["application_id","=","${nasimsId}"]]`;
        const response = await superagent
            .get(url)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Token ${DESK_API_KEY}:${DESK_API_SECRET}`);
        
        const data = JSON.parse(response.text).data;
        return res.status(200).json({ 'status': 'success', 'message': 'Verification Successful', 'data': data }); 
    } catch (err) {

        console.log({ 'status': 'error', 'message': `Verification for ${nasimsId} Failed!` });
        return res.status(422).json({ 'status': err.status, 'message': `Verification for ${nasimsId} Failed!`, 'errorDetails': err });
    }
}

const createQuestion = async (req, res) => {
    const { question, options, answer, time } = req.body;
    const answerIndex = options.indexOf(answer)
    try {
        const newQuestion = await Question.create({
            question, options, answer: answerIndex, time
        })
        res.status(201).json(newQuestion)
    } catch (e) {
        const errData = e.errors
        res.status(503).json({
            'status': 'Database Error',
            'errorDetails': errData.map(er => er.message)
        })
    }
}

module.exports = {
    verify,
    createQuestion
}
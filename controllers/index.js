const superagent = require("superagent");
const { DESK_API_KEY, DESK_API_SECRET, API_URL } = require("../helpers/constants");
const { Question } = require("../models")
const Sequelize = require('sequelize');



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
    const { question, options, answer, time } = req.body;
    const answerIndex = options.indexOf(answer)
    try {
        if (answerIndex === -1) {
            res.status(400).json({
                'status': 'error',
                'message': 'Answer not Part of the Options Array'
            })
        } else {
            newQuestion = await Question.create({
                question, options, answer: answerIndex, time
            })
            res.status(201).json(newQuestion)
         }
    } catch (e) {
        const errData = e.errors
        res.status(503).json({
            'status': 'Database Error',
            'errorDetails': errData.map(er => er.message)
        })
    }
}


const examQuestions = async(req,res) =>{
    try{
       const test = await Question.findAll({order:  Sequelize.literal('random()'), limit: 10 })
       return res.status(200).json({
       test:test
    })
    }
    catch(error){
        console.log(error);
        return  res.status(422).json({error: error}) 
    }

}

const examScore = async(req,res) =>{


}

module.exports = {
    verify,
    createQuestion,
    examQuestions,
    examScore
}
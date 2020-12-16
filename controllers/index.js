const superagent = require("superagent");
const {
  DESK_API_KEY,
  DESK_API_SECRET,
  API_URL,
} = require("../helpers/constants");
const { Question, Applicant } = require("../models");
const { dbErrorFormatter, applicantGrader } = require("../helpers/utils");
const { sequelize } = require("../helpers/db.config");
const { query } = require("express-validator");

const verify = async (req, res) => {
  const { nasimsId } = req.query;

  try {
    const url = `${API_URL}/api/resource/Applicants?fields=["application_id","programme","name"]&filters=[["name","=","${nasimsId}"]]`;
    const response = await superagent
      .get(url)
      .set("Content-Type", "application/json")
      .set("Authorization", `Token ${DESK_API_KEY}:${DESK_API_SECRET}`);

    const data = JSON.parse(response.text).data;
    let applicantTestData;
    let resObj;
    Array.isArray(data) && !data.length
      ? ((resObj = {
          status: "invalid",
          message: `${nasimsId} Not Found In Our Records`,
        }),
        res.status(404))
      : ((applicantTestData = await Applicant.findOrCreate({
          where: { nasimsId: nasimsId },
        })),
        (resObj = {
          status: "success",
          message: "Verification Successful",
          data: applicantTestData,
        }),
        res.status(200));

    return res.json(resObj);
  } catch (err) {
    return res.status(422).json({
      status: err.status,
      message: `Verification for ${nasimsId} Failed!`,
      errorDetails: err,
    });
  }
};

const createQuestion = async (req, res) => {
  const { questions } = req.body;
  const errorMessages = [];
  questions.forEach((questionObject, index) => {
    const answerIndex = questionObject.options.indexOf(questionObject.answer);
    answerIndex === -1
      ? errorMessages.push({
          questionIndex: index,
          message: "Answer not Part of the Options Array",
        })
      : (questionObject.answer = answerIndex);
  });

  try {
    const areValidAnswers = questions.every((question) => question.answer > -1);
    let newQuestions;
    areValidAnswers
      ? ((newQuestions = await Question.bulkCreate(questions)),
        res.status(201).json(newQuestions))
      : res
          .status(406)
          .json({ status: "Invalid Answer Error", errorInfo: errorMessages });
  } catch (e) {
    res.status(500).json({
      status: "Database Error",
      errorDetails: dbErrorFormatter(e),
    });
  }
};

const increaseTestAttempt = async (req, res) => {
  const { nasimsId } = req.query;
  try {
    const applicant = await Applicant.findOne({
      where: { nasimsId: nasimsId },
    });
    applicant.increment("attempts", { where: { nasimsId: nasimsId } });
    const attempts = applicant.attempts + 1;
    res
      .status(200)
      .json({ status: "success", message: "Test Attempt Recorded", attempts });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Login Attempt Was NOT Recorded",
      errorDetails: error,
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      attributes: ["id", "question", "options", "time"],
      limit: 5,
      order: sequelize.random(),
    });
    res.status(200).json({ status: "success", data: questions });
  } catch (error) {
    res
      .status(503)
      .json({ status: "error", message: "Error Fetching Questions" });
  }
};

const gradeApplicant = async (req, res) => {
  const { nasimsId } = req.query;
  const { attempts } = req.body;
  
  try {
    const applicant = await Applicant.findOne({
      where: { nasimsId: nasimsId },
    });

    const [
      candidateScore,
      totalQuestions,
      percentage,
      unavailableQuestions,
    ] = await applicantGrader(attempts, Question);
    
    if (!unavailableQuestions) {
      applicant.score = +candidateScore;
      applicant.questions = JSON.stringify(attempts);
      applicant.save();

      res.status(200).json({
        status: "success",
        message: "Applicant Graded Successfully",
        totalQuestions,
        applicantScore: candidateScore,
        percentageScore: percentage
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Some questions do not exist in our records. Try Again!",
        applicantScore: unavailableQuestions,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Grading Failed",
      errorDetails: error,
    });
  }
};

module.exports = {
  verify,
  createQuestion,
  increaseTestAttempt,
  getQuestions,
  gradeApplicant,
};

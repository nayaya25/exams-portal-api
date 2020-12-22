const superagent = require("superagent");
const {
  DESK_API_KEY,
  DESK_API_SECRET,
  API_URL,
} = require("../helpers/constants");
const { Question, Applicant, Subject } = require("../models");
const { dbErrorFormatter } = require("../helpers/utils");
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
  const { questionList } = req.body;
  const errorMessages = [];
  questionList.forEach((questionData) => {
    const { questions, subjectId } = questionData;
    questions.forEach((question, index) => {
      const answerIndex = question.options.indexOf(question.answer);
      answerIndex === -1
        ? errorMessages.push({
            questionIndex: index,
            message: "Answer not Part of the Options Array",
          })
        : (question.answer = answerIndex),
        (question.subjectId = subjectId);
    });
  });

  try {
    const areValidAnswers = questionList.every((questionObj) =>
      questionObj.questions.every((question) => question.answer > -1)
    );

    if (areValidAnswers) {
      let resultArray = [];
      for (const questionData of questionList) {
        const { questions } = questionData;
        const newQuestions = await Question.bulkCreate(questions);
        resultArray.push(newQuestions);
      }
      res.status(201).json(resultArray);
    } else {
      res
        .status(406)
        .json({ status: "Invalid Answer Error", errorInfo: errorMessages });
    }
  } catch (e) {
    res.status(500).json({
      status: "Database Error",
      errorDetails: e, //dbErrorFormatter(e),
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
  let candidateScore = 0;
  let unavailableQuestions = [];

  try {
    const applicant = await Applicant.findOne({
      where: { nasimsId: nasimsId },
    });

    for (const attempt of attempts) {
      const question = await Question.findOne({
        where: { id: attempt.id },
      });

      if (!question)
        unavailableQuestions.push({
          status: "unfound",
          message: "Question not found",
          data: attempt,
        });

      if (question.options[question.answer] === attempt.answer)
        candidateScore += 1;
    }

    if (unavailableQuestions.length == 0) {
      applicant.score = +candidateScore;
      applicant.questions = JSON.stringify(attempts);
      applicant.scoreScale = "exact";
      applicant.save();
      res.status(200).json({
        status: "success",
        message: "Applicant Graded Successfully",
        applicantScore: candidateScore,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Some Questions Do Not Exist in our records",
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

const createSubject = async (req, res) => {
  const { subjects } = req.body;
  try {
    const results = Subject.bulkCreate(subjects);
    res.status(201).json({ status: "success", data: results });
  } catch (e) {
    res.status(500).json({
      status: "Database Error",
      errorDetails: dbErrorFormatter(e),
    });
  }
};

module.exports = {
  verify,
  createQuestion,
  increaseTestAttempt,
  getQuestions,
  gradeApplicant,
  createSubject,
};

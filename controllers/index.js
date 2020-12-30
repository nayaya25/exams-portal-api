const superagent = require("superagent");
const fs = require("fs");
// const path = require("path");
const formidable = require("formidable");
const csv = require("fast-csv");

const {
  DESK_API_KEY,
  DESK_API_SECRET,
  API_URL,
} = require("../helpers/constants");

const { Question, Applicant, Subject } = require("../models");
const {
  dbErrorFormatter,
  applicantGrader,
  formatCsvRecords,
  saveRecords,
} = require("../helpers/utils");
const { random } = require("../helpers/db.config");

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

const createQuestions = async (req, res) => {
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
      order: random,
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

    if (unavailableQuestions.length === 0) {
      applicant.score = +candidateScore;
      applicant.questions = JSON.stringify(attempts);
      applicant.save();

      res.status(200).json({
        status: "success",
        message: "Applicant Graded Successfully",
        totalQuestions,
        applicantScore: candidateScore,
        percentageScore: percentage,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Some questions do not exist in our records. Try Again!",
        applicantScore: unavailableQuestions,
      });
    }
  } catch (error) {
    console.log(error);
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
    const results = await Subject.bulkCreate(subjects);
    res.status(201).json({ status: "success", data: results });
  } catch (e) {
    res.status(500).json({
      status: "Database Error",
      errorDetails: dbErrorFormatter(e),
    });
  }
};

const getSubjects = async (req, res) => {
  try {
    const results = await Subject.findAll({
      attributes: ["id", "title"],
    });
    res.status(201).json({ status: "success", data: results });
  } catch (e) {
    res.status(500).json({
      status: "Database Error",
      errorDetails: e, //dbErrorFormatter(e),
    });
  }
};

const getSubjectQuestions = async (req, res) => {
  try {
    const results = await Subject.findAll({
      attributes: ["id", "title"],
      include: [
        {
          model: Question,
          as: "Questions",
          attributes: ["id", "question", "options", "time"],
          limit: 2,
          order: random,
        },
      ],
    });
    res.status(200).json({ status: "success", data: results });
  } catch (e) {
    res.status(500).json({
      status: "Database Error",
      errorDetails: e, //dbErrorFormatter(e),
    });
  }
};

const uploadQuestionCsv = async (req, res) => {
  const form = formidable({
    keepExtensions: true,
    maxFileSize: 10485760,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: "CSV File could not be uploaded",
      });
    }

    const { subjectId } = fields;
    let records = [];
    if (files.csvQuestions) {
      let path = files.csvQuestions.path;
      fs.createReadStream(path)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => {
          res.status(400).json({
            status: "error",
            message: "Unable to Read the CSV file",
            data: error,
          });
        })
        .on("data", (row) => {
          row.subjectId = subjectId;
          records.push(row);
        })
        .on("end", (rowCount) => {
          records = formatCsvRecords(records);
          const resp = saveRecords(Question, records);
          resp
            .then((r) => {
              r.status === "success" ? res.status(200) : res.status(500);
              return res.json(r);
            })
            .catch((e) => {
              res.status(500).json(e);
            });
          console.log(`Parsed ${rowCount} rows`);
        });
    } else {
      res.status(500).json({
        status: "error",
        message: "Invalid Field Name for File",
      });
    }
  });
};

module.exports = {
  verify,
  createQuestions,
  increaseTestAttempt,
  getQuestions,
  gradeApplicant,
  createSubject,
  getSubjects,
  getSubjectQuestions,
  uploadQuestionCsv,
};

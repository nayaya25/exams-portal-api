const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./constants");

const validateToken = (req, res, next) => {
  const authorizationHeaader = req.headers.authorization;
  let result;
  if (authorizationHeaader) {
    const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
    const options = {
      expiresIn: "24h",
      issuer: "nasims",
    };
    try {
      result = jwt.verify(token, JWT_SECRET, options);
      req.decoded = result;
      next();
    } catch (err) {
      throw new Error(err);
    }
  } else {
    result = {
      status: "error",
      message: "Authentication error. Token required.",
    };
    res.status(401).send(result);
  }
};

const dbErrorFormatter = (error) => error.errors.map((er) => er.message);

const crudHelper = () => {
  return {
    getAll: async (Model, options = {}) => {
      return await Model.findAll(options);
    },
    getOne: async (Model, id) => {
      return await Model.findOne({ where: { id: id } });
    },
    create: async (Model, data) => {
      return await Model.create(data);
    },
    createMultiple: async (Model, dataArray) => {
      return await Model.bulkCreate(dataArray);
    },
    update: async (Model, data, id) => {
      return await Model.update(data, { where: { id: id } });
    },
    updateMultiple: async (Model, data) => {
      return await Model.update(data);
    },
    deleteRecord: async (Model, id) => {
      return await Model.destroy({ where: { id: id } });
    },
  };
};

const applicantGrader = async (attempts, QuestionModel) => {
  let candidateScore = 0;
  let unfoundQuestions = [];
  let percentage = 0.0;
  const totalQuestions = attempts.length;

  for (const attempt of attempts) {
    const question = await QuestionModel.findOne({
      where: { id: attempt.id },
    });

    if (!question) {
      unfoundQuestions.push({
        status: "unfound",
        message: "Question not found",
        data: attempt,
      });
    } else {
      if (question.options[question.answer] === attempt.answer)
        candidateScore += 1;
    }
  }
  percentage = ((candidateScore / totalQuestions) * 100).toFixed(1);
  return [candidateScore, totalQuestions, percentage, unfoundQuestions];
};

const formatCsvRecords = (records) => {
  records.forEach((record) => {
    const { a, b, c, d } = record;
    record.options = [a, b, c, d];
    record.answer = record.options.indexOf(record[record.answer.toLowerCase()]);
    delete record.a;
    delete record.b;
    delete record.c;
    delete record.d;
  });
  return records;
};

const saveRecords = async (Question, records) => {
  try {
    if (records.length > 0) {
      const results = await Question.bulkCreate(records);
      return {
        status: "success",
        message: "upload completed successfully",
        data: results,
        totalRecords: records.length,
      };
    } else {
      return {
        status: "error",
        message: "upload unsuccessful",
        totalRecords: 0,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Database Error",
      info: {
        message: error.errors[0].message,
        question: error.errors[0].value,
      },
    };
  }
};

module.exports = {
  validateToken,
  dbErrorFormatter,
  crudHelper,
  applicantGrader,
  formatCsvRecords,
  saveRecords,
};

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

const removeDuplicates = (records) => {
  const uniqueRecords = Array.from(new Set(records.map((a) => a.Question))).map(
    (question) => {
      return records.find((a) => a.Question === question);
    }
  );
  return uniqueRecords;
};

const formatCsvRecords = (records) => {
  const uniqueRecords = removeDuplicates(records);
  let newRecords = [];
  uniqueRecords.map((record) => {
    const {
      A,
      B,
      C,
      D,
      E,
      Question,
      Answer,
      subjectId,
      category,
      Instruction,
    } = record;
    let options = [A, B, C, D];
    if (E) options.push(E);
    let answer = options.indexOf(record[Answer.toUpperCase()]);
    const formatedQuestion = {
      subjectId,
      category,
      instructions: Instruction ? Instruction : "",
      question: Question,
      options,
      answer,
    };
    newRecords.push(formatedQuestion);
  });
  return newRecords;
};

const saveRecords = async (Question, records) => {
  if (records.length > 0) {
    try {
      const results = await Question.bulkCreate(records);
      return {
        status: "success",
        message: "upload completed successfully",
        data: results,
        totalRecords: records.length,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Database Error",
        data: error,
      };
    }
  } else {
    return {
      status: "error",
      message: "upload unsuccessful",
      totalRecords: 0,
    };
  }
};

const checkProperties = (obj) => {
  console.log(Object.values(obj));
  return Object.values(obj).every(
    (value) => value !== null && value !== "" && value !== undefined
  );
};

module.exports = {
  validateToken,
  dbErrorFormatter,
  crudHelper,
  applicantGrader,
  formatCsvRecords,
  checkProperties,
  saveRecords,
};

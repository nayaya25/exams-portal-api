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
  
  for (const attempt of attempts) {
    const question = await QuestionModel.findOne({
      where: { id: attempt.id },
    });

    if (!question)
      unfoundQuestions.push({
        status: "unfound",
        message: "Question not found",
        data: attempt,
      });

    if (question.options[question.answer] === attempt.answer)
      candidateScore += 1;
  }

  return [candidateScore, unfoundQuestions]
};

module.exports = {
  validateToken,
  dbErrorFormatter,
  crudHelper,
  applicantGrader,
};

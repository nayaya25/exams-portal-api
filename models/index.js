const Question = require("./question");
const Applicant = require("./applicant");
const Subject = require("./subject");

Subject.hasMany(Question, { as: "Questions", foreignKey: "subjectId" });
Question.belongsTo(Subject, { foreignKey: "subjectId" });

Subject.sync();
Question.sync();
Applicant.sync();

module.exports = {
  Question,
  Applicant,
  Subject,
};

const Question = require("./question");
const Applicant = require("./applicant");
const Subject = require("./subject");
const Admin = require("./admin")

Subject.hasMany(Question, { as: "Questions", foreignKey: "subjectId" });
Question.belongsTo(Subject, { foreignKey: "subjectId" });

Subject.sync();
Question.sync();
Applicant.sync();
Admin.sync();

module.exports = {
  Question,
  Applicant,
  Subject,
  Admin,
};

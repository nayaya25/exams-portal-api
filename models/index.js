const Question = require("./question");
const Applicant = require("./applicant");
const Subject = require("./subject");

Subject.hasMany(Question, {
  as: "Questions",
  foreignKey: "subjectId",
  sourceKey: "id",
});
Question.belongsTo(Subject, { foreignKey: "subjectId" });

Subject.sync({ alter: true });
Question.sync({ alter: true });
Applicant.sync({ alter: true });

module.exports = {
  Question,
  Applicant,
  Subject,
};

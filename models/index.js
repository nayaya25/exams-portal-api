const Question = require("./question");
const Applicant = require("./applicant");
const Subject = require("./subject");
const Admin = require("./admin")

Subject.hasMany(Question, {
  as: "Questions",
  foreignKey: "subjectId",
  sourceKey: "id",
});

Question.belongsTo(Subject, { foreignKey: "subjectId" });

Subject.sync({ alter: true });
Question.sync();
Applicant.sync({ alter: true });
Admin.sync();


module.exports = {
  Question,
  Applicant,
  Subject,
  Admin,
};

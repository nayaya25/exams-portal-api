const { DataTypes, sequelize } = require("../helpers/db.config");

const Applicant = sequelize.define("Applicant", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  applicationId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nasimsId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  programme: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  questions: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: true,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  scoreScale: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "exact",
  },
});

module.exports = Applicant;

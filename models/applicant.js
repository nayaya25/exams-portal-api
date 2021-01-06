const { DataTypes, sequelize } = require("../helpers/db.config");

const Applicant = sequelize.define("Applicant", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  questions: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: true,
  },
  attempts: {
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

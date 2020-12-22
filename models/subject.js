const { DataTypes, sequelize } = require("../helpers/db.config");

const Subject = sequelize.define("Subject", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Subject;

const { DataTypes, sequelize } = require('../helpers/db.config')

const Question = sequelize.define("Question", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
    },
    answer: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    time: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
})

Question.sync({ alter: true })

module.exports = Question




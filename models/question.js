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
        allowNull: false
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

Question.sync({ force: true })

module.exports = Question




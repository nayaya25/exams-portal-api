const { DataTypes, sequelize } = require('../helpers/db.config')

const Applicant = sequelize.define("Applicant", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true
    },
    nasimsId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    questions: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull: true,
    },
    attempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    scoreScale: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'exact'
    }
})

Applicant.sync({ alter: true });

module.exports = Applicant;




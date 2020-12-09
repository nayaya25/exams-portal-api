const { Sequelize, Model, DataTypes } = require('sequelize')
const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER} = require('./constants')

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
    dialect: 'postgres',
    logging: false
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.original);
  });
  
module.exports = {
    sequelize,
    Model,
    DataTypes
}
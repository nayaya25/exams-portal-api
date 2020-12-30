const { DataTypes, sequelize } = require("../helpers/db.config");

const Admin = sequelize.define("Admin", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },

    firstName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    phoneNumber:{
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
        
    },
    activation_code: {
        type: DataTypes.STRING,
        default: null,
        allowNull: true,
    },
    
    active : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
   

});
module.exports = Admin;
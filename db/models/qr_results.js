const {DataTypes, Sequelize}  = require('sequelize');
const {sequelize} = require('../connection');
const {User} = require('./user')

const QrResult = sequelize.define('qr_results', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    }
}, {timestamps: false});
  
module.exports = {QrResult};
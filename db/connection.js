const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('qrscanner', 'root', 'password1234', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = {
    sequelize,
}
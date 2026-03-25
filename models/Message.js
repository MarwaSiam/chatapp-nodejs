const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    content: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Message content is required.' },
            len: { args: [1, 500], msg: '1-500 chars.' }
        }
    },
}, {
    tableName: 'messages',
        paranoid: true,
});

module.exports = Message;
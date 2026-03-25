const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: { msg: 'This email is already registered.' },
        validate: {
            isEmail: { msg: 'Please enter a valid email address.' },
            notEmpty: { msg: 'Email is required.' }
        }
    },
    firstName: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: { args: [3, 32], msg: 'First name must be 3-32 chars.' },
            isAlpha: { msg: 'Letters only.' },
            notEmpty: { msg: 'Required.' }
        }
    },
    lastName: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: { args: [3, 32], msg: 'Last name must be 3-32 chars.' },
            isAlpha: { msg: 'Letters only.' },
            notEmpty: { msg: 'Required.' }
        }
    },
    password: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: { notEmpty: { msg: 'Password is required.' } }
    }
}, {
    tableName: 'users',
});

User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

User.prototype.comparePassword = async function(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

module.exports = User;
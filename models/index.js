const sequelize = require('../config/database');
const User = require('./User');
const Message = require('./Message');

// Associations
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'sender', onDelete: 'CASCADE' });

// Export everything together
module.exports = { sequelize, User, Message };
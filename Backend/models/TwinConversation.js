const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Twin = require('./Twin');

const TwinConversation = sequelize.define('TwinConversation', {
  twinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  visitorName: {
    type: DataTypes.STRING,
    defaultValue: 'Anonymous Recruiter',
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  aiResponse: {
    type: DataTypes.TEXT,
  },
}, {
  indexes: [
    {
      name: 'idx_twin_conversations_twin_created',
      fields: ['twinId', 'createdAt'],
    },
  ],
});

Twin.hasMany(TwinConversation, { foreignKey: 'twinId' });
TwinConversation.belongsTo(Twin, { foreignKey: 'twinId' });

module.exports = TwinConversation;

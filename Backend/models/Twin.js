const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Twin = sequelize.define('Twin', {
  resumeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT('long'),
  },
  title: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  skills: {
    type: DataTypes.JSON,
  },
  experience: {
    type: DataTypes.JSON,
  },
  education: {
    type: DataTypes.JSON,
  },
  rawResumeText: {
    type: DataTypes.TEXT('long'),
  },
  tone: {
    type: DataTypes.STRING,
    defaultValue: 'Professional',
  },
  publicSlug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

module.exports = Twin;

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'resume_twin_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      connectTimeout: 10000,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);

module.exports = sequelize;

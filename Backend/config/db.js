const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'resume_twin_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 15,       // Maximum number of connections in pool
      min: 0,        // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) to try getting a connection before throwing error
      idle: 10000    // Maximum time (ms) a connection can be idle before being released
    },
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);

module.exports = sequelize;

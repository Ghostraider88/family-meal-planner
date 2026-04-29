'use strict';
// CommonJS config consumed by sequelize-cli. Reads from process.env so we can
// share the same DB credentials with the runtime app.
const fs = require('fs');

const fileOrEnv = (name) => {
  const filePath = process.env[`${name}_FILE`];
  if (filePath) {
    try { return fs.readFileSync(filePath, 'utf8').trim(); } catch { return undefined; }
  }
  return process.env[name];
};

const common = {
  username: process.env.DB_USER || 'planner_user',
  password: fileOrEnv('DB_PASSWORD') || '',
  database: process.env.DB_NAME || 'family_meal_planner',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  dialectOptions: process.env.DB_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  define: { timestamps: true, underscored: true },
};

module.exports = {
  development: { ...common },
  test: { ...common, database: process.env.DB_NAME_TEST || `${common.database}_test` },
  production: { ...common, logging: false },
};

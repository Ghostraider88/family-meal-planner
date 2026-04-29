import { Sequelize } from 'sequelize';
import config from './env.js';

const sequelize = new Sequelize(
  config.DB.name,
  config.DB.user,
  config.DB.password,
  {
    host: config.DB.host,
    port: config.DB.port,
    dialect: 'postgres',
    logging: config.NODE_ENV === 'development' && config.LOG_LEVEL === 'debug'
      ? (msg) => console.debug(msg)
      : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: config.DB.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    retry: { max: 3 },
  }
);

export default sequelize;

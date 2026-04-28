import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  family_id: {
    type: DataTypes.UUID,
    references: { model: 'Families', key: 'id' },
  },
  role: {
    type: DataTypes.ENUM('owner', 'member'),
    defaultValue: 'member',
  },
}, { tableName: 'users' });

export default User;

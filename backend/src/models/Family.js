import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Family = sequelize.define('Family', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.UUID,
    references: { model: 'Users', key: 'id' },
  },
}, { tableName: 'families' });

export default Family;

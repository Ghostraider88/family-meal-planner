import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShoppingList = sequelize.define('ShoppingList', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  family_id: {
    type: DataTypes.UUID,
    references: { model: 'Families', key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  store: {
    type: DataTypes.STRING,
  },
  store_mode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.UUID,
    references: { model: 'Users', key: 'id' },
  },
}, { tableName: 'shopping_lists' });

export default ShoppingList;

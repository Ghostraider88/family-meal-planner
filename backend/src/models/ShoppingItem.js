import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShoppingItem = sequelize.define('ShoppingItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  list_id: {
    type: DataTypes.UUID,
    references: { model: 'ShoppingLists', key: 'id', onDelete: 'CASCADE' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL,
  },
  unit: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL,
  },
  checked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  item_order: {
    type: DataTypes.INTEGER,
  },
}, { tableName: 'shopping_items' });

export default ShoppingItem;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Recipe = sequelize.define('Recipe', {
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
  time_minutes: {
    type: DataTypes.INTEGER,
  },
  servings: {
    type: DataTypes.INTEGER,
  },
  difficulty: {
    type: DataTypes.STRING,
  },
  ingredients: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  instructions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  source: {
    type: DataTypes.STRING,
  },
}, { tableName: 'recipes' });

export default Recipe;

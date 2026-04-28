import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MealPlan = sequelize.define('MealPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  family_id: {
    type: DataTypes.UUID,
    references: { model: 'Families', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  meal_type: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'snack', 'dinner'),
    allowNull: false,
  },
  recipe_id: {
    type: DataTypes.UUID,
    references: { model: 'Recipes', key: 'id' },
  },
  custom_name: {
    type: DataTypes.STRING,
  },
  for_people: {
    type: DataTypes.STRING,
  },
  created_by: {
    type: DataTypes.UUID,
    references: { model: 'Users', key: 'id' },
  },
}, { tableName: 'meal_plans' });

export default MealPlan;

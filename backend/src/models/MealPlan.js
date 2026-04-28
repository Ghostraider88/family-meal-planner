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
  },
  custom_name: {
    type: DataTypes.STRING,
  },
  for_people: {
    type: DataTypes.STRING,
  },
  created_by: {
    type: DataTypes.UUID,
  },
}, { tableName: 'meal_plans' });

export default MealPlan;

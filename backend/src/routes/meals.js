import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { authenticate } from '../middleware/authMiddleware.js';
import { MealPlan } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    const where = { family_id: req.user.family_id };

    // If weekStart provided, filter to that week (7 days)
    if (weekStart && /^\d{4}-\d{2}-\d{2}$/.test(weekStart) && !isNaN(Date.parse(weekStart))) {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 7);
      where.date = {
        [Op.gte]: weekStart,
        [Op.lt]: end.toISOString().split('T')[0],
      };
    }

    const meals = await MealPlan.findAll({ where, order: [['date', 'ASC'], ['meal_type', 'ASC']] });
    res.json(meals);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { date, meal_type, recipe_id, custom_name, for_people } = req.body;
    const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];
    if (!date || !meal_type) {
      return res.status(400).json({ error: 'Date and meal_type required' });
    }
    if (!VALID_MEAL_TYPES.includes(meal_type)) {
      return res.status(400).json({ error: `meal_type must be one of: ${VALID_MEAL_TYPES.join(', ')}` });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'date must be a valid YYYY-MM-DD date' });
    }

    const meal = await MealPlan.create({
      id: uuidv4(),
      family_id: req.user.family_id,
      date,
      meal_type,
      recipe_id: recipe_id || null,
      custom_name: custom_name || null,
      for_people: for_people || null,
      created_by: req.user.id,
    });
    res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const meal = await MealPlan.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    res.json(meal);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { date, meal_type, recipe_id, custom_name, for_people } = req.body;
    const meal = await MealPlan.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    await meal.update({
      date: date || meal.date,
      meal_type: meal_type || meal.meal_type,
      recipe_id: recipe_id !== undefined ? recipe_id : meal.recipe_id,
      custom_name: custom_name !== undefined ? custom_name : meal.custom_name,
      for_people: for_people !== undefined ? for_people : meal.for_people,
    });
    res.json(meal);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const meal = await MealPlan.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    await meal.destroy();
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

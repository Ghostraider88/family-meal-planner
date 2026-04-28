import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authMiddleware.js';
import { MealPlan } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const meals = await MealPlan.findAll({
      where: { family_id: req.user.family_id },
    });
    res.json(meals);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { date, meal_type, recipe_id, custom_name, for_people } = req.body;
    if (!date || !meal_type) {
      return res.status(400).json({ error: 'Date and meal_type required' });
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

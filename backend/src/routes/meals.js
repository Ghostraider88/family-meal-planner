import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { MealPlan } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];

const isUuid = param('id').isUUID().withMessage('Invalid id');

const mealBodyValidators = [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('meal_type').isIn(VALID_MEAL_TYPES),
  body('recipe_id').optional({ nullable: true }).isUUID(),
  body('custom_name').optional({ nullable: true }).isString().isLength({ max: 200 }),
  body('for_people').optional({ nullable: true }).isInt({ min: 0, max: 100 }).toInt(),
];

router.get(
  '/',
  query('weekStart').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  validate,
  async (req, res, next) => {
    try {
      const { weekStart } = req.query;
      const where = { family_id: req.user.family_id };

      if (weekStart && !isNaN(Date.parse(weekStart))) {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 7);
        where.date = {
          [Op.gte]: weekStart,
          [Op.lt]: end.toISOString().split('T')[0],
        };
      }

      const meals = await MealPlan.findAll({
        where,
        order: [['date', 'ASC'], ['meal_type', 'ASC']],
      });
      res.json(meals);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/', mealBodyValidators, validate, async (req, res, next) => {
  try {
    const { date, meal_type, recipe_id, custom_name, for_people } = req.body;
    const meal = await MealPlan.create({
      id: uuidv4(),
      family_id: req.user.family_id,
      date,
      meal_type,
      recipe_id: recipe_id || null,
      custom_name: custom_name || null,
      for_people: for_people ?? null,
      created_by: req.user.id,
    });
    res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', isUuid, validate, async (req, res, next) => {
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

router.put('/:id', [isUuid, ...mealBodyValidators.map((v) => v.optional())], validate, async (req, res, next) => {
  try {
    const meal = await MealPlan.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    const { date, meal_type, recipe_id, custom_name, for_people } = req.body;
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

router.delete('/:id', isUuid, validate, async (req, res, next) => {
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

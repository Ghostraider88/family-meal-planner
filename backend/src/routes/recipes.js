import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authMiddleware.js';
import { Recipe } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const recipes = await Recipe.findAll({ where: { family_id: req.user.family_id } });
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, time_minutes, servings, difficulty, ingredients, instructions, tags, source } = req.body;
    const recipe = await Recipe.create({
      id: uuidv4(),
      family_id: req.user.family_id,
      name,
      time_minutes,
      servings,
      difficulty,
      ingredients: ingredients || [],
      instructions: instructions || [],
      tags: tags || [],
      source,
    });
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, time_minutes, servings, difficulty, ingredients, instructions, tags, source } = req.body;
    const recipe = await Recipe.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    await recipe.update({
      name: name || recipe.name,
      time_minutes: time_minutes !== undefined ? time_minutes : recipe.time_minutes,
      servings: servings !== undefined ? servings : recipe.servings,
      difficulty: difficulty || recipe.difficulty,
      ingredients: ingredients || recipe.ingredients,
      instructions: instructions || recipe.instructions,
      tags: tags || recipe.tags,
      source: source || recipe.source,
    });
    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    await recipe.destroy();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

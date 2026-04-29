import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { Recipe } from '../models/index.js';
import { parsePdfRecipe } from '../services/pdfParserService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(authenticate);

const isUuid = param('id').isUUID().withMessage('Invalid id');

const recipeBodyValidators = [
  body('name').isString().trim().isLength({ min: 1, max: 200 }),
  body('time_minutes').optional({ nullable: true }).isInt({ min: 0, max: 10000 }).toInt(),
  body('servings').optional({ nullable: true }).isInt({ min: 0, max: 1000 }).toInt(),
  body('difficulty').optional({ nullable: true }).isIn(['easy', 'medium', 'hard']),
  body('ingredients').optional().isArray({ max: 200 }),
  body('instructions').optional().isArray({ max: 200 }),
  body('tags').optional().isArray({ max: 30 }),
  body('source').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

router.get('/', async (req, res, next) => {
  try {
    const recipes = await Recipe.findAll({ where: { family_id: req.user.family_id } });
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

router.post('/', recipeBodyValidators, validate, async (req, res, next) => {
  try {
    const { name, time_minutes, servings, difficulty, ingredients, instructions, tags, source } = req.body;
    const recipe = await Recipe.create({
      id: uuidv4(),
      family_id: req.user.family_id,
      name: name.trim(),
      time_minutes: time_minutes ?? null,
      servings: servings ?? null,
      difficulty: difficulty || null,
      ingredients: ingredients || [],
      instructions: instructions || [],
      tags: Array.isArray(tags) ? tags : [],
      source: source?.trim() || null,
    });
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', isUuid, validate, async (req, res, next) => {
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

router.put('/:id', [isUuid, ...recipeBodyValidators.map((v) => v.optional())], validate, async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const { name, time_minutes, servings, difficulty, ingredients, instructions, tags, source } = req.body;
    await recipe.update({
      name: name ?? recipe.name,
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

router.delete('/:id', isUuid, validate, async (req, res, next) => {
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

// PDF Import endpoint
router.post('/import/pdf', upload.single('pdf'), async (req, res, _next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const parsedRecipe = await parsePdfRecipe(req.file.buffer);

    res.json({
      preview: parsedRecipe,
      message: 'PDF parsed successfully. Review and edit before saving.',
    });
  } catch (err) {
    res.status(400).json({ error: `PDF parsing error: ${err.message}` });
  }
});

export default router;

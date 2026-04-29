import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { registerUser, loginUser, refreshUserToken } from '../services/authService.js';

const router = express.Router();

const registerValidators = [
  body('email').isEmail().withMessage('Valid email required').isLength({ max: 255 }),
  body('password')
    .isString().withMessage('Password required')
    .isLength({ min: 12, max: 256 })
    .withMessage('Password must be between 12 and 256 characters'),
  body('name')
    .isString().withMessage('Name required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email required').isLength({ max: 255 }),
  body('password').isString().isLength({ min: 1, max: 256 }).withMessage('Password required'),
];

router.post('/register', registerValidators, validate, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'Email already exists') {
      return res.status(409).json({ error: err.message });
    }
    if (
      err.message === 'Invalid email format' ||
      err.message?.startsWith('Password must') ||
      err.message === 'Name too long'
    ) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/login', loginValidators, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid email or password') {
      // Generic message; avoid email-existence disclosure
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(err);
  }
});

router.post(
  '/refresh',
  body('refreshToken').isString().notEmpty().isLength({ max: 4096 }),
  validate,
  async (req, res, _next) => {
    try {
      const token = refreshUserToken(req.body.refreshToken);
      res.json({ token });
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
);

router.post('/logout', (_req, res) => {
  // Stateless logout — client clears its tokens. If cookie auth is added,
  // also clear the refresh cookie here.
  res.json({ message: 'Logged out' });
});

export default router;

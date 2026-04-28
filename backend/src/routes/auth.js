import express from 'express';
import { registerUser, loginUser, refreshToken } from '../services/authService.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'No refresh token' });
    const newToken = refreshToken(token);
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;

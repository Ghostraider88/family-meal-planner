import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { User, Family } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/me', async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) await user.update({ name });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/family/members', async (req, res, next) => {
  try {
    const members = await User.findAll({
      where: { family_id: req.user.family_id },
      attributes: { exclude: ['password_hash'] },
    });
    res.json(members);
  } catch (err) {
    next(err);
  }
});

router.post('/family/invite', async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Email invites coming in Phase 2' });
  } catch (err) {
    next(err);
  }
});

router.delete('/family/members/:id', async (req, res, next) => {
  try {
    const family = await Family.findByPk(req.user.family_id);
    if (family.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user || user.family_id !== req.user.family_id) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
});

export default router;

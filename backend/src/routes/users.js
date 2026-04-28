import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { User, Family } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  family_id: user.family_id,
  role: user.role,
  created_at: user.created_at,
});

router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
});

router.put('/me', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) await user.update({ name: name.trim() });
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
});

router.get('/family/members', async (req, res, next) => {
  try {
    const members = await User.findAll({ where: { family_id: req.user.family_id } });
    res.json(members.map(safeUser));
  } catch (err) {
    next(err);
  }
});

router.post('/family/invite', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const { createInvite } = await import('../services/inviteService.js');
    const invite = await createInvite(req.user.family_id, email.toLowerCase(), req.user.id);
    res.status(201).json({ message: 'Invitation sent', invite });
  } catch (err) {
    next(err);
  }
});

router.get('/family/invites', async (req, res, next) => {
  try {
    const { getFamilyInvites } = await import('../services/inviteService.js');
    const invites = await getFamilyInvites(req.user.family_id);
    res.json(invites);
  } catch (err) {
    next(err);
  }
});

router.delete('/family/invites/:id', async (req, res, next) => {
  try {
    const { cancelInvite } = await import('../services/inviteService.js');
    await cancelInvite(req.params.id, req.user.family_id);
    res.json({ message: 'Invite cancelled' });
  } catch (err) {
    next(err);
  }
});

router.delete('/family/members/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    const family = await Family.findByPk(req.user.family_id);
    if (!family || family.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    const member = await User.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Disassociate from family rather than deleting the account
    await member.update({ family_id: null, role: 'member' });
    res.json({ message: 'Member removed from family' });
  } catch (err) {
    next(err);
  }
});

export default router;

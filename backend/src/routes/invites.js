import express from 'express';
import { getInviteByToken, acceptInvite, declineInvite } from '../services/inviteService.js';

const router = express.Router();

// Public routes - no authentication needed yet (user might not be logged in)
router.get('/:token', async (req, res, next) => {
  try {
    const invite = await getInviteByToken(req.params.token);
    res.json({
      id: invite.id,
      family_name: invite.Family.name,
      invited_email: invite.invited_email,
      status: invite.status,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:token/accept', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await acceptInvite(req.params.token, email);
    res.json({ message: 'Invite accepted', user });
  } catch (err) {
    next(err);
  }
});

router.post('/:token/decline', async (req, res, next) => {
  try {
    await declineInvite(req.params.token);
    res.json({ message: 'Invite declined' });
  } catch (err) {
    next(err);
  }
});

export default router;

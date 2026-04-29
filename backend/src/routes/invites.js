import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { getInviteByToken, acceptInvite, declineInvite } from '../services/inviteService.js';

const router = express.Router();

// Tokens are URL-safe random; cap length to avoid abuse
const tokenParam = param('token').isString().isLength({ min: 16, max: 256 });

router.use(authLimiter);

router.get('/:token', tokenParam, validate, async (req, res, next) => {
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

router.post(
  '/:token/accept',
  [tokenParam, body('email').isEmail().isLength({ max: 255 })],
  validate,
  async (req, res, next) => {
    try {
      const user = await acceptInvite(req.params.token, req.body.email);
      res.json({ message: 'Invite accepted', user });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/:token/decline', tokenParam, validate, async (req, res, next) => {
  try {
    await declineInvite(req.params.token);
    res.json({ message: 'Invite declined' });
  } catch (err) {
    next(err);
  }
});

export default router;

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { FamilyInvite, User, Family } from '../models/index.js';
import { sendInviteEmail } from './emailService.js';

export const createInvite = async (familyId, invitedEmail, invitedByUserId) => {
  const family = await Family.findByPk(familyId);
  if (!family) throw new Error('Family not found');

  const existingUser = await User.findOne({ where: { email: invitedEmail } });
  if (existingUser && existingUser.family_id === familyId) {
    throw new Error('User is already in this family');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await FamilyInvite.create({
    id: uuidv4(),
    family_id: familyId,
    invited_email: invitedEmail,
    invited_by: invitedByUserId,
    token,
    expires_at: expiresAt,
    status: 'pending',
  });

  try {
    await sendInviteEmail(invitedEmail, family.name, token);
  } catch (err) {
    await invite.destroy();
    throw err;
  }

  return invite;
};

export const getInviteByToken = async (token) => {
  const invite = await FamilyInvite.findOne({
    where: { token, status: 'pending' },
    include: [{ model: Family }, { model: User, as: 'InvitedBy' }],
  });

  if (!invite) throw new Error('Invite not found or expired');
  if (new Date() > invite.expires_at) {
    await invite.update({ status: 'declined' });
    throw new Error('Invite has expired');
  }

  return invite;
};

export const acceptInvite = async (token, userEmail) => {
  const invite = await getInviteByToken(token);

  if (invite.invited_email !== userEmail) {
    throw new Error('Email does not match invitation');
  }

  let user = await User.findOne({ where: { email: userEmail } });

  if (!user) {
    user = await User.create({
      id: uuidv4(),
      email: userEmail,
      password_hash: '',
      name: userEmail.split('@')[0],
      family_id: invite.family_id,
      role: 'member',
    });
  } else if (user.family_id) {
    throw new Error('User is already in a family');
  } else {
    await user.update({ family_id: invite.family_id });
  }

  await invite.update({ status: 'accepted' });

  return user;
};

export const declineInvite = async (token) => {
  const invite = await getInviteByToken(token);
  await invite.update({ status: 'declined' });
  return invite;
};

export const getFamilyInvites = async (familyId) => {
  const invites = await FamilyInvite.findAll({
    where: { family_id: familyId, status: 'pending' },
    include: [{ model: User, as: 'InvitedBy', attributes: ['id', 'name', 'email'] }],
  });
  return invites;
};

export const cancelInvite = async (inviteId, familyId) => {
  const invite = await FamilyInvite.findOne({
    where: { id: inviteId, family_id: familyId, status: 'pending' },
  });
  if (!invite) throw new Error('Invite not found');
  await invite.destroy();
};

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database.js';
import config from '../config/env.js';
import { User, Family } from '../models/index.js';

const signToken = (payload) =>
  jwt.sign(payload, config.JWT.secret, {
    expiresIn: config.JWT.expiresIn,
    issuer: config.JWT.issuer,
    audience: config.JWT.audience,
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, config.JWT.refreshSecret, {
    expiresIn: config.JWT.refreshExpiresIn,
    issuer: config.JWT.issuer,
    audience: config.JWT.audience,
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 12;

export const registerUser = async (email, password, name) => {
  if (!email || !password || !name) throw new Error('All fields required');
  if (!EMAIL_RE.test(email)) throw new Error('Invalid email format');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > 256) throw new Error('Password too long');
  if (typeof name !== 'string' || name.trim().length === 0) throw new Error('Name required');
  if (name.length > 100) throw new Error('Name too long');

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) throw new Error('Email already exists');

  // Use transaction to prevent orphaned Family records on User creation failure
  const result = await sequelize.transaction(async (t) => {
    const family = await Family.create({
      id: uuidv4(),
      name: `${name}'s Family`,
    }, { transaction: t });

    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = await User.create({
      id: uuidv4(),
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      name: name.trim(),
      family_id: family.id,
      role: 'owner',
    }, { transaction: t });

    await family.update({ owner_id: user.id }, { transaction: t });

    return { user, family };
  });

  const { user, family } = result;
  const token = signToken({ id: user.id, email: user.email, family_id: family.id });
  const refreshToken = signRefreshToken({ id: user.id });

  return {
    user: { id: user.id, email: user.email, name: user.name, family_id: family.id },
    token,
    refreshToken,
  };
};

export const loginUser = async (email, password) => {
  if (!email || !password) throw new Error('Email and password required');

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  // Use constant-time comparison path to prevent user enumeration timing attacks
  const dummyHash = '$2a$12$invalidhashfortimingnormalization000000000000000000000';
  const isValid = user
    ? await bcryptjs.compare(password, user.password_hash)
    : await bcryptjs.compare(password, dummyHash);

  if (!user || !isValid) throw new Error('Invalid email or password');

  if (!user.password_hash) {
    throw new Error('Account setup incomplete. Please use your invitation link to set a password.');
  }

  const token = signToken({ id: user.id, email: user.email, family_id: user.family_id });
  const refreshToken = signRefreshToken({ id: user.id });

  return {
    user: { id: user.id, email: user.email, name: user.name, family_id: user.family_id },
    token,
    refreshToken,
  };
};

export const refreshUserToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT.refreshSecret, {
      issuer: config.JWT.issuer,
      audience: config.JWT.audience,
    });
    // Re-issue an access token. The new token does not extend the refresh window.
    return signToken({ id: decoded.id });
  } catch {
    throw new Error('Invalid refresh token');
  }
};

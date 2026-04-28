import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database.js';
import { User, Family } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-only-insecure-refresh-secret';

const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

const signRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

export const registerUser = async (email, password, name) => {
  if (!email || !password || !name) throw new Error('All fields required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
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
      name,
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
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return signToken({ id: decoded.id });
  } catch {
    throw new Error('Invalid refresh token');
  }
};

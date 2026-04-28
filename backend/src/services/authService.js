import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, Family } from '../models/index.js';

export const registerUser = async (email, password, name) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already exists');

  const family = await Family.create({
    id: uuidv4(),
    name: `${name}'s Family`,
  });

  const hashedPassword = await bcryptjs.hash(password, 10);
  const user = await User.create({
    id: uuidv4(),
    email,
    password_hash: hashedPassword,
    name,
    family_id: family.id,
    role: 'owner',
  });

  family.owner_id = user.id;
  await family.save();

  const token = jwt.sign(
    { id: user.id, email: user.email, family_id: family.id },
    process.env.JWT_SECRET || 'your-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name, family_id: family.id },
    token,
    refreshToken,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isValid = await bcryptjs.compare(password, user.password_hash);
  if (!isValid) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { id: user.id, email: user.email, family_id: user.family_id },
    process.env.JWT_SECRET || 'your-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name, family_id: user.family_id },
    token,
    refreshToken,
  };
};

export const refreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    const token = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET || 'your-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    return token;
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
};

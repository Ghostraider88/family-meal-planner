import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

const message = { error: 'Too many requests, please try again later' };

/**
 * Global API limiter — applies to every /api request.
 */
export const apiLimiter = rateLimit({
  windowMs: config.RATE.windowMs,
  max: config.RATE.max,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

/**
 * Strict limiter for auth-sensitive endpoints (login, register, refresh,
 * password setup, family invite). Counts per IP to slow brute force.
 */
export const authLimiter = rateLimit({
  windowMs: config.RATE.windowMs,
  max: config.RATE.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

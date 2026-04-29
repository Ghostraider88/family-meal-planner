import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.JWT.secret, {
      issuer: config.JWT.issuer,
      audience: config.JWT.audience,
    });
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Centralized error handler. In production, never leak stack traces or
 * internal error messages on 5xx responses.
 */
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  if (config.isProd) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${status} -- ${err.name}: ${err.message}`
    );
  } else {
    console.error(err);
  }

  const body = { error: status < 500 ? err.message || 'Bad request' : 'Internal server error' };
  if (!config.isProd && status >= 500) body.detail = err.message;

  res.status(status).json(body);
};

/**
 * 404 handler for unknown API routes — keeps responses consistent.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};

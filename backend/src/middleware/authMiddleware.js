import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your-secret' || JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET is not set or is using default value in production!');
    process.exit(1);
  } else {
    console.warn('WARNING: Using insecure default JWT_SECRET. Set JWT_SECRET in .env for production.');
  }
}

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'dev-only-insecure-secret');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
  } else {
    console.error(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal server error',
  });
};

import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

// Known dev/insecure secrets. Production hard-aborts if any of these slip in.
const KNOWN_INSECURE_SECRETS = new Set([
  'your-secret',
  'your-super-secret-jwt-key-change-in-production',
  'your-super-secret-refresh-key',
  'dev-jwt-secret-replace-before-production-use',
  'dev-refresh-secret-replace-before-production-use',
  'dev-jwt-secret-not-for-production-use-min-32-chars-x',
  'dev-refresh-secret-not-for-production-use-min-32-chars',
  'dev-only-insecure-secret',
  'dev-only-insecure-refresh-secret',
  'change-me',
  'changeme',
  'secret',
]);

const MIN_SECRET_LENGTH = 32;

const readSecretFile = (filePath, name) => {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    throw new Error(`Failed to read ${name} from ${filePath}: ${err.code || err.message}`);
  }
};

/**
 * Resolve a value from either ENV or *_FILE env, preferring *_FILE when set.
 * Allows Docker Compose `secrets:` style without losing simple .env support.
 */
const fromEnvOrFile = (name) => {
  const fileVar = `${name}_FILE`;
  if (process.env[fileVar]) {
    return readSecretFile(process.env[fileVar], name);
  }
  return process.env[name];
};

const parseBool = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(value));
};

const parseInt10 = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

const parseTrustProxy = (raw) => {
  if (raw === undefined || raw === '') return 'loopback';
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const asNum = Number(raw);
  if (Number.isFinite(asNum)) return asNum;
  return raw;
};

const validateSecret = (label, value, errors) => {
  if (!value) {
    errors.push(`${label} is required`);
    return;
  }
  if (KNOWN_INSECURE_SECRETS.has(value)) {
    errors.push(`${label} is set to a known insecure default value`);
  }
  if (value.length < MIN_SECRET_LENGTH) {
    errors.push(`${label} must be at least ${MIN_SECRET_LENGTH} characters`);
  }
};

const buildConfig = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const isProd = NODE_ENV === 'production';

  const JWT_SECRET = fromEnvOrFile('JWT_SECRET');
  const JWT_REFRESH_SECRET = fromEnvOrFile('JWT_REFRESH_SECRET');
  const DB_PASSWORD = fromEnvOrFile('DB_PASSWORD');
  const SMTP_PASSWORD = fromEnvOrFile('SMTP_PASSWORD');

  const config = {
    NODE_ENV,
    isProd,
    PORT: parseInt10(process.env.PORT, 3001),

    DB: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt10(process.env.DB_PORT, 5432),
      name: process.env.DB_NAME || 'family_meal_planner',
      user: process.env.DB_USER || 'planner_user',
      password: DB_PASSWORD || '',
      ssl: parseBool(process.env.DB_SSL, false),
    },

    JWT: {
      secret: JWT_SECRET,
      refreshSecret: JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || (isProd ? '15m' : '24h'),
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'family-meal-planner',
      audience: process.env.JWT_AUDIENCE || 'family-meal-planner-api',
    },

    HTTP: {
      corsOrigin: process.env.CORS_ORIGIN || '',
      frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '',
      cookieSecure: parseBool(process.env.COOKIE_SECURE, isProd),
      cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
      trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
      bodyLimit: process.env.BODY_LIMIT || '1mb',
    },

    RATE: {
      windowMs: parseInt10(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: parseInt10(process.env.RATE_LIMIT_MAX, 300),
      authMax: parseInt10(process.env.AUTH_RATE_LIMIT_MAX, 10),
    },

    LOG_LEVEL: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),

    SMTP: {
      service: process.env.SMTP_SERVICE || '',
      user: process.env.SMTP_USER || '',
      password: SMTP_PASSWORD || '',
    },
  };

  // ----- Validation ---------------------------------------------------------
  const errors = [];

  if (isProd) {
    validateSecret('JWT_SECRET', JWT_SECRET, errors);
    validateSecret('JWT_REFRESH_SECRET', JWT_REFRESH_SECRET, errors);

    if (JWT_SECRET && JWT_REFRESH_SECRET && JWT_SECRET === JWT_REFRESH_SECRET) {
      errors.push('JWT_SECRET and JWT_REFRESH_SECRET must differ');
    }

    if (!DB_PASSWORD) errors.push('DB_PASSWORD is required in production');
    if (!config.HTTP.corsOrigin) errors.push('CORS_ORIGIN is required in production');
    if (config.HTTP.corsOrigin === '*') errors.push('CORS_ORIGIN must not be "*" in production');
  } else {
    // Soft-warn in dev if secrets look weak, but never abort
    if (!JWT_SECRET || (JWT_SECRET.length < MIN_SECRET_LENGTH)) {
      console.warn(`[env] WARNING: JWT_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} chars (dev mode).`);
    }
  }

  if (errors.length > 0) {
    console.error('FATAL: invalid environment configuration:');
    for (const e of errors) console.error(`  - ${e}`);
    console.error('Refusing to start. See .env.example for required variables.');
    process.exit(1);
  }

  return config;
};

const config = buildConfig();

export default config;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import sequelize from './config/database.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/authMiddleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiters.js';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import mealRoutes from './routes/meals.js';
import shoppingRoutes from './routes/shopping.js';
import userRoutes from './routes/users.js';
import inviteRoutes from './routes/invites.js';

const app = express();

// Disable the X-Powered-By: Express header
app.disable('x-powered-by');

// Trust proxy is configured via TRUST_PROXY env var. Required for correct
// client IP detection behind Nginx for rate limiting.
app.set('trust proxy', config.HTTP.trustProxy);

// --- Security headers ---
app.use(helmet({
  // CSP intentionally omitted here; configured at the Nginx layer in prod.
  // Enabling a strict default CSP would break the dev Vite server.
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// --- CORS allowlist ---
const allowedOrigins = config.HTTP.corsOrigin
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / non-browser requests with no Origin header
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
  maxAge: 86400,
}));

// --- Body parsing ---
app.use(express.json({ limit: config.HTTP.bodyLimit }));
app.use(express.urlencoded({ extended: false, limit: config.HTTP.bodyLimit }));

// --- Global rate limit ---
app.use('/api/', apiLimiter);

// --- Health & readiness ---
// Liveness: service is up. Cheap, no DB call.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness: includes DB connectivity. Used by deeper monitoring.
app.get('/api/ready', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// --- Routes ---
// authLimiter scoped to auth endpoints. apiLimiter still applies globally.
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invites', inviteRoutes);

// 404 for unknown /api routes
app.use('/api', notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// --- Startup ---
const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection verified');

    // Production must NEVER auto-sync schemas. Migrations are the only source
    // of truth for production schema changes.
    if (!config.isProd) {
      await sequelize.sync({ alter: false });
    }

    const server = app.listen(config.PORT, () => {
      logger.info(`Server listening on :${config.PORT} (env=${config.NODE_ENV})`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        sequelize.close().then(() => {
          logger.info('Database connection closed. Exiting.');
          process.exit(0);
        }).catch((err) => {
          logger.error(`DB close error: ${err.message}`);
          process.exit(1);
        });
      });
      // Hard kill if shutdown stalls
      setTimeout(() => {
        logger.error('Forced shutdown after 10s timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
};

start();

export default app;

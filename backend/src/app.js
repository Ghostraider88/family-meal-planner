import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import sequelize from './config/database.js';
import { errorHandler } from './middleware/authMiddleware.js';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import mealRoutes from './routes/meals.js';
import shoppingRoutes from './routes/shopping.js';
import userRoutes from './routes/users.js';
import inviteRoutes from './routes/invites.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

// Body size limit prevents DoS via large payloads
app.use(express.json({ limit: '1mb' }));

// Strict rate limit on auth endpoints to slow brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invites', inviteRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use(errorHandler);

// Sequelize sync with alter:false in production to prevent accidental schema changes
const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: false };

sequelize.sync(syncOptions).then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown: finish in-flight requests before exiting
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      sequelize.close().then(() => {
        console.log('✅ Database connection closed. Exiting.');
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

export default app;

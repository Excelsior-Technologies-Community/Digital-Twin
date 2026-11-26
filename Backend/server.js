require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const sequelize = require('./config/db');
const { ensureDatabaseIndexes } = require('./utils/ensureIndexes');
const twinRoutes = require('./routes/twinRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
require('./models/Twin');
require('./models/TwinConversation');

const app = express();

app.set('trust proxy', 1);

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  : [];

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_DEV_ORIGINS;

app.use(helmet());

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      const contentType = res.getHeader('Content-Type');
      if (String(contentType || '').includes('text/event-stream')) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsError = new Error('Origin not allowed by CORS policy.');
      corsError.statusCode = 403;
      return callback(corsError);
    },
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'],
  })
);

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

app.use((req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    return next();
  }
  const startNs = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
    console.log(`[${req.method}] ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(1)}ms`);
  });
  next();
});

app.get('/api/health', async (req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'ok',
      db: 'connected',
      geminiConfigured,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Health check database connectivity error:', err.message);
    return res.status(503).json({
      status: 'degraded',
      db: 'disconnected',
      geminiConfigured,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/twins', twinRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server = null;
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}, initiating graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing process exit.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await sequelize.close();
    console.log('Server and database connections closed.');
    process.exit(0);
  } catch (err) {
    console.error('Graceful shutdown failed:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

const startServer = async () => {
  try {
    await sequelize.sync();
    await ensureDatabaseIndexes(sequelize);
    console.log('MySQL Database Connected & Synced');
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
  } catch (err) {
    console.error('Database sync failed:', err.message);
    process.exitCode = 1;
  }
};

startServer();

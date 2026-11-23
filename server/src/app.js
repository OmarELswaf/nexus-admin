const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Vercel sits behind a proxy; needed for rate limits.
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Same-origin on Vercel; the CORS whitelist only matters for local dev
  // (Vite dev server on :5173 talking to the API on :5000).
  app.use(
    '/api',
    cors({
      origin: (origin, cb) => {
        if (!origin || origin === config.clientOrigin) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    })
  );

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'rate_limited', message: 'Too many requests, slow down' },
    })
  );

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), demo: config.dataMode === 'memory' });
  });

  app.use('/api/auth', require('./routes/auth.routes'));
  app.use('/api/users', require('./routes/users.routes'));
  app.use('/api/orders', require('./routes/orders.routes'));
  app.use('/api/products', require('./routes/products.routes'));
  app.use('/api/analytics', require('./routes/analytics.routes'));

  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found', message: 'Unknown API route' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[nexus] unhandled error:', err.message);
    res.status(500).json({ error: 'server_error', message: 'Something went wrong' });
  });

  return app;
}

module.exports = { createApp };

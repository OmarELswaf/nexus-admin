const config = {
  port: Number(process.env.PORT || 5000),
  // Demo fallback keeps local setup zero-config. Set JWT_SECRET in production.
  jwtSecret: process.env.JWT_SECRET || 'nexus-dev-secret-change-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  // 'file' persists to server/data/db.json; 'memory' reseeds on every boot.
  dataMode: process.env.DATA_MODE || 'file',
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (config.nodeEnv === 'production' && config.jwtSecret === 'nexus-dev-secret-change-me') {
  // Never refuse to boot on serverless demo deploys; log loudly instead.
  console.warn('[nexus] WARNING: JWT_SECRET is not set. Using the built-in dev secret.');
}

module.exports = config;

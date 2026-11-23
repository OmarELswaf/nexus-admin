const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('./config');
const { state, persist } = require('./store');

const ROLES = ['viewer', 'manager', 'admin'];

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name, type: 'access' },
    config.jwtSecret,
    { expiresIn: config.accessTokenTtl }
  );
}

function signRefreshToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: user.id, jti, type: 'refresh' }, config.jwtSecret, {
    expiresIn: config.refreshTokenTtl,
  });
  return { token, jti };
}

function revokeRefresh(jti) {
  state.revokedRefreshIds.push(jti);
  // Keep the revocation list bounded.
  if (state.revokedRefreshIds.length > 5000) {
    state.revokedRefreshIds = state.revokedRefreshIds.slice(-5000);
  }
  persist();
}

function verify(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

// Express middleware: requires a valid access token.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token && verify(token);
  if (!payload || payload.type !== 'access') {
    return res.status(401).json({ error: 'unauthorized', message: 'Valid access token required' });
  }
  const user = state.users.find((u) => u.id === payload.sub);
  if (!user || !user.active) {
    return res.status(401).json({ error: 'unauthorized', message: 'Account not found or deactivated' });
  }
  req.user = user;
  next();
}

// Express middleware factory: requires one of the given roles.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: `Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { ROLES, signAccessToken, signRefreshToken, revokeRefresh, verify, requireAuth, requireRole };

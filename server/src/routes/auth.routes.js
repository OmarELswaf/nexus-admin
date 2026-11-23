const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { state, persist } = require('../store');
const { signAccessToken, signRefreshToken, revokeRefresh, verify, requireAuth } = require('../auth');
const { validate, loginSchema } = require('../validate');

const router = express.Router();

const REFRESH_COOKIE = 'nexus_refresh';
const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.nodeEnv === 'production',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Brute-force protection on credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Too many attempts, try again later' },
});

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt };
}

router.post('/login', authLimiter, validate(loginSchema), (req, res) => {
  const { email, password } = req.body;
  const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.active || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
  }
  const accessToken = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  res.json({ accessToken, user: publicUser(user) });
});

router.post('/refresh', (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const payload = token && verify(token);
  if (!payload || payload.type !== 'refresh' || state.revokedRefreshIds.includes(payload.jti)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Refresh token invalid or revoked' });
  }
  const user = state.users.find((u) => u.id === payload.sub);
  if (!user || !user.active) {
    return res.status(401).json({ error: 'unauthorized', message: 'Account not found or deactivated' });
  }
  // Rotate: revoke the presented refresh token, issue a fresh pair.
  revokeRefresh(payload.jti);
  const accessToken = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  res.json({ accessToken, user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const payload = token && verify(token);
  if (payload?.jti) revokeRefresh(payload.jti);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOpts, maxAge: undefined });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;

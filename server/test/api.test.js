// Integration tests for the auth flow and RBAC. Runs against a real
// listening instance on an ephemeral port using the built-in fetch.
process.env.DATA_MODE = 'memory';
process.env.JWT_SECRET = 'test-secret';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

let server;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

async function api(path, { method = 'GET', token, body, cookie } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json(), setCookie: res.headers.get('set-cookie') };
}

test('health endpoint responds', async () => {
  const { status, body } = await api('/api/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('login fails with wrong password', async () => {
  const { status, body } = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@nexus.dev', password: 'wrong-password' },
  });
  assert.equal(status, 401);
  assert.equal(body.error, 'invalid_credentials');
});

test('login succeeds, /me returns the user, logout revokes refresh', async () => {
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@nexus.dev', password: 'NexusDemo!2026' },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, 'admin');
  assert.ok(login.body.accessToken);
  assert.ok(login.setCookie.includes('nexus_refresh='));

  const me = await api('/api/auth/me', { token: login.body.accessToken });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'admin@nexus.dev');

  // Refresh rotation: first refresh works, replaying the same cookie fails.
  const cookie = login.setCookie.split(';')[0];
  const refresh = await api('/api/auth/refresh', { method: 'POST', cookie });
  assert.equal(refresh.status, 200);
  assert.ok(refresh.body.accessToken);
  const replay = await api('/api/auth/refresh', { method: 'POST', cookie });
  assert.equal(replay.status, 401);
});

test('validation rejects malformed login bodies', async () => {
  const { status, body } = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'not-an-email', password: '' },
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'validation_error');
});

test('RBAC: viewer cannot list users, admin can', async () => {
  const viewerLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'viewer@nexus.dev', password: 'NexusDemo!2026' },
  });
  const denied = await api('/api/users', { token: viewerLogin.body.accessToken });
  assert.equal(denied.status, 403);

  const adminLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@nexus.dev', password: 'NexusDemo!2026' },
  });
  const allowed = await api('/api/users', { token: adminLogin.body.accessToken });
  assert.equal(allowed.status, 200);
  assert.ok(allowed.body.users.length >= 2);
});

test('orders require auth and support filtering', async () => {
  const unauth = await api('/api/orders');
  assert.equal(unauth.status, 401);

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'viewer@nexus.dev', password: 'NexusDemo!2026' },
  });
  const list = await api('/api/orders?status=delivered&page=1&pageSize=5', { token: login.body.accessToken });
  assert.equal(list.status, 200);
  assert.ok(list.body.orders.length <= 5);
  assert.ok(list.body.orders.every((o) => o.status === 'delivered'));
});

test('analytics overview returns KPIs and series', async () => {
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'viewer@nexus.dev', password: 'NexusDemo!2026' },
  });
  const { status, body } = await api('/api/analytics/overview', { token: login.body.accessToken });
  assert.equal(status, 200);
  assert.ok(body.kpis.totalOrders > 0);
  assert.equal(body.series.length, 90);
  assert.ok(body.recentOrders.length > 0);
});

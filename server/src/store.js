// Tiny JSON data layer. 'file' mode persists to server/data/db.json (local dev);
// 'memory' mode reseeds on every boot (Vercel demo, read-only filesystem).
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { buildSeed } = require('./seed-data');
const config = require('./config');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function freshState() {
  const seed = buildSeed();
  return {
    users: [
      {
        id: 'usr_admin',
        name: 'Demo Admin',
        email: 'admin@nexus.dev',
        // Demo credential, documented in the README. Not a real secret.
        passwordHash: bcrypt.hashSync('NexusDemo!2026', 10),
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_viewer',
        name: 'Demo Viewer',
        email: 'viewer@nexus.dev',
        passwordHash: bcrypt.hashSync('NexusDemo!2026', 10),
        role: 'viewer',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
    products: seed.products,
    orders: seed.orders,
    series: seed.series,
    revokedRefreshIds: [],
  };
}

let state;
if (config.dataMode === 'file') {
  try {
    state = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    state = freshState();
    persist();
  }
} else {
  state = freshState();
}

function persist() {
  if (config.dataMode !== 'file') return;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, DB_PATH);
}

function nextId(prefix, collection) {
  const max = collection.reduce((m, r) => {
    const n = Number(String(r.id).split('_')[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}_${max + 1}`;
}

module.exports = { state, persist, nextId };

// Vercel serverless entry point: wraps the Express app as a single function.
// DATA_MODE defaults to in-memory on Vercel (read-only filesystem), so demo
// data resets on cold starts. Local dev uses file persistence instead.
process.env.DATA_MODE = process.env.DATA_MODE || 'memory';

const { createApp } = require('../server/src/app');

const app = createApp();

module.exports = app;

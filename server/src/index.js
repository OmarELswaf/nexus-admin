const { createApp } = require('./app');
const config = require('./config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`[nexus] API listening on http://localhost:${config.port} (data mode: ${config.dataMode})`);
});

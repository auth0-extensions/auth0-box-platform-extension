const tools = require('auth0-extension-express-tools');

const expressApp = require('./server');
const logger = require('./server/lib/logger');

module.exports = tools.createServer((config, storage) => {
  logger.info('Starting Box Serverless Extension - Version:', config('CLIENT_VERSION'));
  return expressApp(config, storage);
});

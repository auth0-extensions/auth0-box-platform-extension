import path from 'path';
import morgan from 'morgan';
import Express from 'express';
import bodyParser from 'body-parser';
import { middlewares, routes } from 'auth0-extension-express-tools';

import logger from './lib/logger';
import config from './lib/config';
import api from './routes/api';
import meta from './routes/meta';
import hooks from './routes/hooks';
import htmlRoute from './routes/html';

module.exports = (configProvider) => {
  config.setProvider(configProvider);

  const app = new Express();
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
    stream: logger.stream
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Configure routes.
  app.use(routes.dashboardAdmins({
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:box-serverless',
    rta: config('AUTH0_RTA'),
    domain: config('AUTH0_DOMAIN'),
    baseUrl: config('WT_URL'),
    clientName: 'Box Serverless Extension',
    urlPrefix: '/admins',
    sessionStorageKey: 'box-serverless:apiToken',
    scopes: 'read:clients read:resource_servers'
  }));

  // Configure routes.
  app.use('/api', api());
  app.use('/app', Express.static(path.join(__dirname, '../dist')));
  app.use('/meta', meta());
  app.use('/.extensions', hooks());

  // Fallback to rendering HTML.
  app.get('*', htmlRoute());

  // Generic error handler.
  app.use(middlewares.errorHandler(logger.error));
  return app;
};

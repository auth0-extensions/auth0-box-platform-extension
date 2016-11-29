import path from 'path';
import Promise from 'bluebird';
import { Router } from 'express';
import { urlHelpers, middlewares } from 'auth0-extension-express-tools';

import config from '../lib/config';
import { getAppUserToken } from '../lib/box';
import { getClient, getResourceServer } from '../lib/queries';

export default () => {
  const api = Router();
  const adminMiddlewares = [
    middlewares.authenticateAdmins({
      credentialsRequired: true,
      secret: config('EXTENSION_SECRET'),
      audience: 'urn:box-serverless',
      baseUrl: config('PUBLIC_WT_URL')
    }),
    middlewares.managementApiClient({
      domain: config('AUTH0_DOMAIN')
    })
  ];

  api.get('/config', adminMiddlewares, (req, res, next) => {
    Promise.all([ getClient(req, config('AUDIENCE')), getResourceServer(req, config('AUDIENCE')) ])
      .then(([ client, resourceServer ]) => res.json({
        domain: config('AUTH0_DOMAIN'),
        audience: config('AUDIENCE'),
        isClient: client != null || resourceServer == null,
        isResourceServer: resourceServer != null,
        tokenEndpoint: path.join(urlHelpers.getBaseUrl(req), '/token')
            .replace('http:/', 'http://')
            .replace('https:/', 'https://')
      }))
      .catch(next);
  });

  api.get('/token', (req, res, next) => {
    getAppUserToken(req.user, req.headers.authorization.split(' ')[1])
      .then(res.json)
      .catch(next);
  });
  return api;
};

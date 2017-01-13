import path from 'path';
import Promise from 'bluebird';
import { Router } from 'express';
import { urlHelpers, middlewares } from 'auth0-extension-express-tools';

import config from '../lib/config';
import { getAppUserToken, provisionAppUser } from '../lib/box';
import { getClient, getResourceServer } from '../lib/queries';
import requireApiKey from '../lib/middlewares/requireApiKey';
import authenticateUser from '../lib/middlewares/authenticateUser';

export default () => {
  const api = Router();
  const adminMiddlewares = [
    middlewares.authenticateAdmins({
      credentialsRequired: true,
      secret: config('EXTENSION_SECRET'),
      audience: 'urn:box-platform',
      baseUrl: config('PUBLIC_WT_URL')
    }),
    middlewares.managementApiClient({
      domain: config('AUTH0_DOMAIN')
    })
  ];

  api.get('/config', adminMiddlewares, (req, res, next) => {
    Promise.all([ getClient(req, config('AUTH0_AUDIENCE')), getResourceServer(req, config('AUTH0_AUDIENCE')) ])
      .then(([ client, resourceServer ]) => res.json({
        domain: config('AUTH0_DOMAIN'),
        audience: config('AUTH0_AUDIENCE'),
        isClient: client != null || resourceServer == null,
        isResourceServer: resourceServer != null,
        tokenEndpoint: path.join(urlHelpers.getBaseUrl(req), '/token')
            .replace('http:/', 'http://')
            .replace('https:/', 'https://')
      }))
      .catch(next);
  });

  let isSecretEncoded = config('AUTH0_SECRET_ENCODED');
  if (isSecretEncoded === 'true') isSecretEncoded = true;
  if (isSecretEncoded === '' || isSecretEncoded === 'false') isSecretEncoded = false;

  const auth = authenticateUser(config('AUTH0_DOMAIN'), config('AUTH0_AUDIENCE'), config('AUTH0_SECRET'), isSecretEncoded);
  api.post('/token', auth, (req, res, next) => {
    getAppUserToken(req.user, req.body.token)
      .then(token => res.json(token))
      .catch(next);
  });

  api.post('/provision', requireApiKey(config('EXTENSION_SECRET')), (req, res, next) => {
    provisionAppUser(req.body.user)
      .then(appUser => res.json(appUser))
      .catch(next);
  });
  return api;
};

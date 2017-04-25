import _ from 'lodash';
import { Router as router } from 'express';
import { middlewares } from 'auth0-extension-express-tools';

import config from '../lib/config';
import logger from '../lib/logger';
import compileRule from '../lib/compileRule';
import { getResourceServer, createResourceServer, deleteResourceServer } from '../lib/queries';

export default () => {
  const hooks = router();
  const hookValidator = middlewares
    .validateHookToken(config('AUTH0_DOMAIN'), config('WT_URL'), config('EXTENSION_SECRET'));

  hooks.use('/on-install', hookValidator('/.extensions/on-install'));
  hooks.use('/on-uninstall', hookValidator('/.extensions/on-uninstall'));
  hooks.use(middlewares.managementApiClient({
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  }));

  hooks.post('/on-install', (req, res) => {
    req.auth0
      .rules
      .getAll()
      .then((rules) => {
        const payload = {
          name: 'auth0-box-platform',
          script: compileRule(config, 'auth0-box-platform')
        };

        const rule = _.find(rules, { name: 'auth0-box-platform' });
        if (rule) {
          return req.auth0.rules.update({ id: rule.id }, payload);
        }

        return req.auth0.rules.create({ stage: 'login_success', ...payload });
      })
      .then(() => {
        logger.debug('Rule for the Box Platform extension created.');
      })
      .then(() => getResourceServer(req))
      .then((resourceServer) => {
        if (!resourceServer) {
          return createResourceServer(req);
        }

        return Promise.resolve();
      })
      .then(() => {
        logger.debug('Resource server for the Box Platform extension created.');
      })
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.debug('Error deploying resources for the Box Platform extension.');
        logger.error(err);

        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(400);
      });
  });

  hooks.delete('/on-uninstall', (req, res) => {
    const clientId = config('AUTH0_CLIENT_ID');
    req.auth0.clients.delete({ client_id: clientId })
      .then(() => {
        logger.debug(`Client for the Box Platform extension deleted: ${clientId}`);
      })
      .then(() => req.auth0.rules.getAll())
      .then((rules) => {
        const rule = _.find(rules, { name: 'auth0-box-platform' });
        if (rule) {
          return req.auth0.rules.delete({ id: rule.id });
        }

        return Promise.resolve();
      })
      .then(() => {
        logger.debug('Rule for the Box Platform extension created.');
      })
      .then(() => getResourceServer(req))
      .then((resourceServer) => {
        if (resourceServer) {
          return deleteResourceServer(req);
        }

        return Promise.resolve();
      })
      .then(() => {
        logger.debug('Resource server for the Box Platform extension deleted.');
      })
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.debug('Error deleting resources for the Box Platform extension.');
        logger.error(err);

        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(204);
      });
  });
  return hooks;
};

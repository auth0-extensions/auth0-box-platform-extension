import _ from 'lodash';
import { Router as router } from 'express';
import { middlewares } from 'auth0-extension-express-tools';

import config from '../lib/config';
import logger from '../lib/logger';
import compileRule from '../lib/compileRule';

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
      .then(rules => {
        const payload = {
          name: 'auth0-box-serverless',
          script: compileRule(config, 'auth0-authz-extension')
        };

        const rule = _.find(rules, { name: 'auth0-authz' });
        if (rule) {
          return req.auth0.rules.update({ id: rule.id }, payload);
        }

        return req.auth0.rules.create({ stage: 'login_success', ...payload });
      })
      .then(() => {
        logger.debug('Box rule deployed.');
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.debug('Error deploying Box rule.');
        logger.error(err);

        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(400);
      });
  });

  hooks.delete('/on-uninstall', (req, res) => {
    const clientId = config('AUTH0_CLIENT_ID');
    req.auth0.clients.delete({ client_id: clientId })
      .then(() => {
        logger.debug(`Deleted client ${clientId}`);
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.debug(`Error deleting client: ${config('AUTH0_CLIENT_ID')}`);
        logger.error(err);

        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(204);
      });
  });
  return hooks;
};

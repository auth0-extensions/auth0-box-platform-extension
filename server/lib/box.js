import uuid from 'uuid';
import request from 'request';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from 'auth0-extension-tools';

import logger from './logger';
import config from './config';

const BoxConstants = {
  HEADERS: {
    V2_AUTH_ACCESS: 'Bearer'
  },
  DEFAULT_SETTINGS: {
    JWT_EXPIRATION: '10s',
    JWT_ALGORITHM: 'RS256',
    JWT_TYPE: 'JWT',
    JWT_GRANT_TYPE: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
  },
  BASE_URL: 'https://api.box.com/oauth2/token',
  APP_USERS_URL: 'https://api.box.com/2.0/users',
  ENTERPRISE: 'enterprise',
  USER: 'user'
};

const issueAppUserToken = (publicKeyId, signingCert, boxClientId, boxId) => jwt.sign(
  {
    iss: boxClientId,
    aud: BoxConstants.BASE_URL,
    jti: uuid.v4(),
    sub: boxId,
    box_sub_type: BoxConstants.USER
  },
  signingCert,
  {
    header: {
      typ: BoxConstants.DEFAULT_SETTINGS.JWT_TYPE,
      kid: publicKeyId
    },
    expiresIn: BoxConstants.DEFAULT_SETTINGS.JWT_EXPIRATION,
    noTimestamp: true,
    algorithm: BoxConstants.DEFAULT_SETTINGS.JWT_ALGORITHM
  }
);

const getBoxId = user => Promise.resolve(user && user['http://box-platform/appuser/id']);

const getSigningCert = (signingCert, password) => {
  if (password && password.length) {
    return {
      key: signingCert,
      passphrase: password
    };
  }

  return signingCert;
};

export const settings = () => {
  try {
    const boxSettings = JSON.parse(config('BOX_SETTINGS_FILE'));
    return {
      boxAppSettings: {
        clientID: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.clientID,
        clientSecret: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.clientSecret,
        appAuth: {
          publicKeyID: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.appAuth && boxSettings.boxAppSettings.appAuth.publicKeyID,
          privateKey: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.appAuth && boxSettings.boxAppSettings.appAuth.privateKey,
          passphrase: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.appAuth && boxSettings.boxAppSettings.appAuth.passphrase
        }
      },
      enterpriseID: boxSettings.enterpriseID
    };
  } catch (e) {
    logger.error(e);
    return {

    };
  }
};

export const getEnterpriseToken = () => {
  const signingCert = getSigningCert(settings().boxAppSettings.appAuth.privateKey, settings().boxAppSettings.appAuth.passphrase);
  const token = jwt.sign(
    {
      iss: settings().boxAppSettings.clientID,
      aud: BoxConstants.BASE_URL,
      jti: uuid.v4(),
      sub: settings().enterpriseID,
      box_sub_type: BoxConstants.ENTERPRISE,
      exp: Math.floor((Date.now() / 1000) + 30)
    },
    signingCert,
    {
      header: {
        typ: BoxConstants.DEFAULT_SETTINGS.JWT_TYPE,
        kid: settings().boxAppSettings.appAuth.publicKeyID
      },
      algorithm: BoxConstants.DEFAULT_SETTINGS.JWT_ALGORITHM
    }
  );

  const formData = {
    grant_type: BoxConstants.DEFAULT_SETTINGS.JWT_GRANT_TYPE,
    client_id: settings().boxAppSettings.clientID,
    client_secret: settings().boxAppSettings.clientSecret,
    assertion: token
  };

  logger.info('Getting Box Enterprise token...');
  return new Promise((resolve, reject) => {
    request.post({ url: BoxConstants.BASE_URL, form: formData, json: true }, (err, res, body) => {
      if (err) {
        logger.error('Box Error:', JSON.stringify(err, null, 2));
        return reject(err);
      }

      if (res.statusCode !== 200 || !body) {
        logger.error('Box Error:', JSON.stringify(res, null, 2));

        const boxError = new Error(`${(body && body.error_description) || res.text || res.statusCode}`);
        boxError.name = 'box_error';
        boxError.status = res.statusCode;
        return reject(boxError);
      }

      return resolve(body.access_token);
    });
  });
};

export const provisionAppUser = user =>
  getEnterpriseToken()
    .then((enterpriseToken) => {
      const options = {
        headers: {
          Authorization: `Bearer ${enterpriseToken}`
        },
        url: BoxConstants.APP_USERS_URL,
        json: {
          name: user.email,
          is_platform_access_only: true
        }
      };


      logger.info('Provisioning Box App User...');
      return new Promise((resolve, reject) => {
        request.post(options, (err, res, body) => {
          if (err) {
            logger.error('Box Error:', JSON.stringify(err, null, 2));
            return reject(err);
          }

          if (res.statusCode >= 300 || !body) {
            logger.error('Box Error:', JSON.stringify(res, null, 2));

            const boxError = new Error(`${(body && body.error_description) || res.text || res.statusCode}`);
            boxError.name = 'box_error';
            boxError.status = res.statusCode;
            return reject(boxError);
          }

          return resolve(res.body);
        });
      });
    });

export const getAppUserToken = user =>
  getBoxId(user)
    .then((boxId) => {
      if (!boxId || !boxId.length) {
        return Promise.reject(new UnauthorizedError('The current user does not have a boxId.'));
      }

      const signingCert = getSigningCert(settings().boxAppSettings.appAuth.privateKey, settings().boxAppSettings.appAuth.passphrase);
      const appUserToken = issueAppUserToken(settings().boxAppSettings.appAuth.publicKeyID, signingCert, settings().boxAppSettings.clientID, boxId);
      const formData = {
        grant_type: BoxConstants.DEFAULT_SETTINGS.JWT_GRANT_TYPE,
        client_id: settings().boxAppSettings.clientID,
        client_secret: settings().boxAppSettings.clientSecret,
        assertion: appUserToken
      };

      return new Promise((resolve, reject) => {
        request.post({ url: BoxConstants.BASE_URL, form: formData, json: true }, (err, res, body) => {
          if (err) {
            logger.error('Box Error:', JSON.stringify(err, null, 2));
            return reject(err);
          }

          if (res.statusCode !== 200 || !body) {
            logger.error('Box Error:', JSON.stringify(res, null, 2));

            const boxError = new Error(`${(body && body.error_description) || res.text || res.statusCode}`);
            boxError.name = 'box_error';
            boxError.status = res.statusCode;
            return reject(boxError);
          }

          const boxToken = body;
          return resolve(boxToken);
        });
      });
    });

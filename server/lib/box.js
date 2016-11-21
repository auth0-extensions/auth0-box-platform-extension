import uuid from 'uuid';
import auth0 from 'auth0';
import request from 'request';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from 'auth0-extension-tools';

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

const getBoxId = (domain, user, token) => {
  const auth = new auth0.AuthenticationClient({
    clientId: user.azp || user.aud,
    domain
  });

  return auth.tokens.getInfo(token)
    .then(profile => profile && profile.app_metadata && profile.app_metadata.box_id);
};

export const getAppUserToken = (user, token) =>
  getBoxId(config('AUTH0_DOMAIN'), user, token)
    .then((boxId) => {
      if (!boxId || !boxId.length) {
        return Promise.reject(new UnauthorizedError('The current user does not have a boxId.'));
      }

      const signingCert = new Buffer(config('BOX_SIGNING_CERT'), 'base64').toString('ascii');
      const appUserToken = issueAppUserToken(config('BOX_PUBLIC_KEY_ID'), signingCert, config('BOX_CLIENT_ID'), boxId);
      const formData = {
        grant_type: BoxConstants.DEFAULT_SETTINGS.JWT_GRANT_TYPE,
        client_id: config('BOX_CLIENT_ID'),
        client_secret: config('BOX_CLIENT_SECRET'),
        assertion: appUserToken
      };
      return new Promise((resolve, reject) => {
        request.post({ url: BoxConstants.BASE_URL, form: formData }, (err, res) => {
          if (err) {
            reject(err);
          }

          if (res.statusCode !== 200 || !res.body) {
            return reject('Box Error:', (res.text || res.statusCode));
          }

          const boxToken = JSON.parse(res.body);
          boxToken.expires_at = Date.now() + 2700000;
          return resolve(boxToken);
        });
      });
    });

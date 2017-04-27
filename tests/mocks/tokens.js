import nock from 'nock';
import jwt from 'jsonwebtoken';
import certs from './certs.json';
import config from '../../server/lib/config';

module.exports.wellKnownEndpoint = (domain, cert, kid) =>
   nock(`https://${domain}`)
    .get('/.well-known/jwks.json')
    .times(2)
    .reply(200, {
      keys: [
        {
          alg: 'RS256',
          use: 'sig',
          kty: 'RSA',
          x5c: [ cert.match(/-----BEGIN CERTIFICATE-----([\s\S]*)-----END CERTIFICATE-----/i)[1].replace('\n', '') ],
          kid
        }
      ]
    })
;

module.exports.sign = (cert, kid, payload) =>
   jwt.sign(payload, cert, { header: { kid }, algorithm: 'RS256' })
;

module.exports.getToken = (boxId) => {
  const data = {
    iss: `https://${config('AUTH0_DOMAIN')}/`,
    aud: 'urn:auth0-authz-api',
    sub: 'foo'
  };

  if (boxId) {
    data['http://box-platform/appuser/id'] = boxId;
  }

  return module.exports.sign(certs.bar.private, 'key2', data);
};

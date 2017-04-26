const nock = require('nock');
const expect = require('chai').expect;
const { UnauthorizedError } = require('auth0-extension-tools');
const config = require('../../server/lib/config');
const box = require('../../server/lib/box');

const settings = {
  BOX_SETTINGS_FILE: '{"boxAppSettings": {"clientID": "boxClientId", "clientSecret": "boxClientSecret", "appAuth": {"publicKeyID": "je266u07", "privateKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----\\nMIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQIz4OeYNPh5Y8CAggA\\nMBQGCCqGSIb3DQMHBAicrxpryxpLwwSCBMjr0Al4PuRSyKcEZltoLDYUoxOADJMc\\nNCzfrOVJWWJG0H9qBeGYiycQDrQNTdW+yKhJzNAJwnmxpvpUpiRPMbC/MCOsG/Yn\\nfLUNFV5sFZuBcmwBlNqr8Yx/0DhN5pLgKc/9TQyXyxL7cZmD1EDiSjWGaifevjDg\\nuHLENgmQ64L6P5fc/ycxNq+ca6gPw1h7Jdr+tvHhnIbVqcJ8KVOZc8wZ4Cbt12RC\\nkzO7CFjfdVLPZp4Au+3wGGSq4jdIjj7JQoDoA1WwwjlQyqAhtOT9/MIdC4hQ/egJ\\nYSYQl+xGrQcawdZ+dnxxvCqrtAPv++FS1DEyCY0mfKw2T1atEwDnlT3G3YE4DRZ/\\n6Xl4GiaFxh3smK35hqUBWlmu8vgk9lNX14gRIF67SyppnjRaELwOqputbmVEmnX2\\nIHwu9PJtJFRylMqA70uVVejgZBsqSF191De9vjMHHv8SECzMjh0OPC2FVux4JjfS\\n7eazWMgmHClmxAut4ou6miCjIVyrUujR4ltdfScQII/gdcvxLUjsTJt/YNHkIiCT\\nRoHcwXUaYVmqPDOG77TLD1ec49VCFdxJxgWYFp7ngYwEqb4IydR4G7qe8uDYBUb+\\nxPgF6MHmolxevxNWC+LO0i2luFi5tSEokIMZC/mH5HbwLLixWzcaK/nTKmJRCex1\\n75TjZr8+4CzgaJ1poKGBlfTfDP7plt4/yyzwr6jwkzpZTWx2CNvxwu8NxEBs8Yn4\\nOR7O2w6evI2cXPSedaL8MKW2u6YZ5i5dnPN4SsT2Kpi8KyjmJpdKsRQUAVVjQ6sZ\\n9PFXNm9h+PEnRCAzm5bgp36ArO7R2evORXyBzzapTqEIGzsGKdtiyhRgCC/1XRtM\\n1mQhBP4HMYOjHdcdsvfVotjmNZ3iYypouGBUYcDwQT8yAnpdkw64r1Lu6TV93SHo\\n4AOTCiBcy53yGUDD14inF3wFZpnN32S2Ka/be63MMWTKAo3e0lPpOJHl05U1hBT7\\nkc7FG6Ng1QcR0+PFjLyGk8PHNqdBUOZsIRPgTEmeUGiAa6KGYuLEkbbWw/gn6jnB\\nVUNss9Iq3z6414e2AQob+KlYlGuYuMYJA5P+nXYfNIeXb+wjGAW/HmFTbwtRPH7C\\nYcau/b7A6SPPRz3QLWt7/EZ36fB3lw17E/rhPJLxDi1mpHxfo4Pp+0m4U6y5paCB\\nN4x160bdMmj3DykR+kbVEARx3dCN7qkrj3er1JBT7vraR0N7jd5yeqAL/tYi4hm2\\nFgEjmiw3t+DKQ9vCGWKF78gAXar51IrjbSJFIack78Lda7fvvClbDgZn6UKt2gtW\\nh+Dsvi7L2EZ7CPWJiCs6elqI/DZ5f2p/cinaSwNasT1qUkKbPKo0EpgK8HkAM3r2\\nwu/1kENEHKy7imr/ORQX4591dtSrxZrb1YiV4vpweKaWfPvC813NyGvnKuKk6o9B\\noy9oRSXhCoQt/+FD/6kLmHX+SCUgVy2tNuAwQZCwqU0aZs3qAPfaGqqRsyWGQfhJ\\nFSvPzjL1ZA9KjD1EU+r37wdui2AWMKhwlrlje9SYwZaVqppmboDObE9mhsvPNPL6\\nUIWIXrAzgwNtsWiw1w7TQe3xqzDNj+EvgycXqk3X/XBoVxarnmGHAY1mAa68WpHZ\\ny0I=\\n-----END ENCRYPTED PRIVATE KEY-----\\n", "passphrase": "3bccff81b298352fbb5cd7101cd8e871"}}, "enterpriseID": "boxEnterpriseID"}'
};

describe('Box Lib Testing', () => {
  before((done) => {
    config.setProvider(key => settings[key]);
    done();
  });

  describe('getAppUserToken', () => {
    it('should return error if no userdata', (done) => {
      box.getAppUserToken({})
        .then(() => null)
        .catch((err) => {
          expect(err).to.be.instanceOf(UnauthorizedError, /The current user does not have a boxId./);
          done();
        });
    });

    it('should return error from box', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(400, 'some error');

      box.getAppUserToken({ 'http://box-platform/appuser/id': 'boxId' })
        .then(() => null)
        .catch((err) => {
          nock.cleanAll();
          expect(err).to.be.instanceOf(Error, /some error/);
          done();
        });
    });

    it('should return some token', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'someBoxToken');

      box.getAppUserToken({ 'http://box-platform/appuser/id': 'boxId' })
        .then((boxToken) => {
          nock.cleanAll();
          expect(boxToken).to.equal('someBoxToken');
          done();
        });
    });
  });

  describe('provisionAppUser', () => {
    it('should return error if cannot get enterprise token', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(400, 'no enterprise token');

      box.provisionAppUser({ email: 'email@example.com' })
        .then(() => null)
        .catch((err) => {
          nock.cleanAll();
          expect(err).to.be.instanceOf(Error, /no enterprise token/);
          done();
        });
    });

    it('should return error from box', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'enterpriseToken');

      nock('https://api.box.com')
        .post('/2.0/users')
        .reply(400, 'some error');

      box.provisionAppUser({ email: 'email@example.com' })
        .then(() => null)
        .catch((err) => {
          nock.cleanAll();
          expect(err).to.be.instanceOf(Error, /some error/);
          done();
        });
    });

    it('should return new userdata', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'enterpriseToken');

      nock('https://api.box.com')
        .post('/2.0/users')
        .reply(200, { id: 'someNewUserId' });

      box.provisionAppUser({ email: 'email@example.com' })
        .then((res) => {
          nock.cleanAll();
          expect(res.id).to.equal('someNewUserId');
          done();
        });
    });
  });
});

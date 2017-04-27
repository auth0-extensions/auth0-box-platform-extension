import nock from 'nock';
import { expect } from 'chai';
import { UnauthorizedError } from 'auth0-extension-tools';
import { getAppUserToken, provisionAppUser } from '../../server/lib/box';

describe('Box Lib Testing', () => {
  describe('getAppUserToken', () => {
    it('should return error if no userdata', (done) => {
      getAppUserToken({})
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

      getAppUserToken({ 'http://box-platform/appuser/id': 'boxId' })
        .then(() => null)
        .catch((err) => {
          expect(err).to.be.instanceOf(Error, /some error/);
          done();
        });
    });

    it('should return some token', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'someBoxToken');

      getAppUserToken({ 'http://box-platform/appuser/id': 'boxId' })
        .then((boxToken) => {
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

      provisionAppUser({ email: 'email@example.com' })
        .then(() => null)
        .catch((err) => {
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

      provisionAppUser({ email: 'email@example.com' })
        .then(() => null)
        .catch((err) => {
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

      provisionAppUser({ email: 'email@example.com' })
        .then((res) => {
          expect(res.id).to.equal('someNewUserId');
          done();
        });
    });
  });
});

import nock from 'nock';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { expect } from 'chai';

import { getToken } from '../mocks/tokens';
import api from '../../server/routes/api';
import delegation from '../../server/routes/delegation';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

describe('Endpoints Testing', () => {
  describe('delegation', () => {
    it('should return error if not authorized', (done) => {
      app.use('/delegation-error', delegation());

      request(app)
        .get('/delegation-error')
        .expect(401)
        .end((err) => {
          if (err) throw err;
          done();
        });
    });

    it('should return error if user has no boxId', (done) => {
      const setTestData = (req, res, next) => {
        const token = getToken();
        req.headers.authorization = `Bearer ${token}`;
        next();
      };

      app.use('/delegation-no-box-id', setTestData, delegation());

      request(app)
        .get('/delegation-no-box-id')
        .expect(401)
        .end((err) => {
          if (err) throw err;
          done();
        });
    });

    it('should return box token', (done) => {
      const setTestData = (req, res, next) => {
        const token = getToken('someBoxId');
        req.headers.authorization = `Bearer ${token}`;
        next();
      };

      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'someBoxToken');

      app.use('/delegation-ok', setTestData, delegation());

      request(app)
        .get('/delegation-ok')
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.equal('someBoxToken');
          done();
        });
    });
  });

  describe('provision', () => {
    it('should return error if not authorized', (done) => {
      app.use('/api-error', api());

      request(app)
        .post('/api-error/provision')
        .expect(401)
        .end((err) => {
          if (err) throw err;
          done();
        });
    });

    it('should create box user', (done) => {
      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'enterpriseToken');

      nock('https://api.box.com')
        .post('/2.0/users')
        .reply(200, { id: 'someNewUserId' });

      const setTestData = (req, res, next) => {
        req.headers['x-api-key'] = 'abc';
        req.body = { user: { email: 'email@example.com' } };
        next();
      };

      app.use('/api-ok', setTestData, api());

      request(app)
        .post('/api-ok/provision')
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.be.an('object');
          expect(res.body.id).to.equal('someNewUserId');
          done();
        });
    });
  });
});

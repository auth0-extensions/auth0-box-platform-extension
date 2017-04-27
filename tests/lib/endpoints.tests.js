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
app.use('/delegation', delegation());
app.use('/api', api());

describe('Endpoints Testing', () => {
  describe('delegation', () => {
    it('should return error if not authorized', (done) => {
      request(app)
        .get('/delegation')
        .expect(401)
        .end((err) => {
          if (err) throw err;
          done();
        });
    });

    it('should return error if origin is not allowed', (done) => {
      const token = getToken('get:token', 'someBoxId');

      request(app)
        .get('/delegation')
        .set('Authorization', `Bearer ${token}`)
        .set('origin', 'http://example.com')
        .expect(401)
        .end((err, res) => {
          if (err) throw err;
          expect(res.error.text).contain('http://example.com');
          expect(res.error.text).contain('not allowed by CORS');
          done();
        });
    });

    it('should return error if no scope', (done) => {
      const token = getToken(null, 'someBoxId');

      request(app)
        .get('/delegation')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .end((err) => {
          if (err) throw err;
          done();
        });
    });

    it('should return error if user has no boxId', (done) => {
      const token = getToken('get:token');

      request(app)
        .get('/delegation')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .end((err) => {
          if (err) throw err;
          done();
        });
    });

    it('should return box token', (done) => {
      const token = getToken('get:token', 'someBoxId');

      nock('https://api.box.com')
        .post('/oauth2/token')
        .reply(200, 'someBoxToken');

      app.use('/delegation', delegation());

      request(app)
        .get('/delegation')
        .set('Authorization', `Bearer ${token}`)
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
      request(app)
        .post('/api/provision')
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

      request(app)
        .post('/api/provision')
        .set('x-api-key', 'abc')
        .send({ user: { email: 'email@example.com' } })
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.be.an('object');
          expect(res.body.id).to.equal('someNewUserId');
          done();
        });
    });
  });
});

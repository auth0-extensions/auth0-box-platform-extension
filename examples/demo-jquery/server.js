const http = require('http');
const path = require('path');
const morgan = require('morgan');
const logger = require('./logger');

const express = require('express');
const hbs = require('express-hbs');
const app = express();
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: logger.stream
}));

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const nconf = require('nconf');
nconf.env()
  .file({ file: './config.json' })
  .defaults({
    PORT: 7001,
    CALLBACK_URL: "http://localhost:7001"
  });

app.get('/', (req, res) => {
  res.render('index', {
    CALLBACK_URL: nconf.get('CALLBACK_URL'),
    AUTH0_DOMAIN: nconf.get('AUTH0_DOMAIN'),
    AUTH0_CLIENT_ID: nconf.get('AUTH0_CLIENT_ID'),
    BOX_DELEGATION_ENDPOINT: nconf.get('BOX_DELEGATION_ENDPOINT')
  });
});

http.createServer(app).listen(nconf.get('PORT'), () => {
  logger.info('Auth0 - Box Platform Demo listening on: http://localhost:' + nconf.get('PORT'));
});

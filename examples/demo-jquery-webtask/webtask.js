const express = require('express');
const Webtask = require('webtask-tools');

const view = require('./view');

const app = express();
app.get('/', view);

module.exports = Webtask.fromExpress(app);

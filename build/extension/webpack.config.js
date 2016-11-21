const _ = require('lodash');
const path = require('path');
const Webpack = require('webpack');
const project = require('../../package.json');
const externalModules = require('./externals');

module.exports = externalModules.then((externals) => {
  externals.compatible.bluebird = true;
  externals.compatible.ejs = true;
  externals.compatible.express = true;
  externals.compatible['express-jwt'] = true;
  externals.compatible.lodash = true;
  externals.compatible.morgan = true;
  externals.compatible.qs = true;
  externals.compatible.superagent = true;
  externals.compatible.winston = true;
  externals.compatible.auth0 = 'auth0@2.1.0';
  externals.compatible.jsonwebtoken = true;
  externals.compatible['body-parser'] = true;
  externals.compatible['webtask-tools'] = true;

  // Transform to commonjs.
  Object.keys(externals.compatible).forEach(k => {
    if (externals.compatible[k] === true) {
      externals.compatible[k] = `commonjs ${k}`;
    } else {
      externals.compatible[k] = `commonjs ${externals.compatible[k]}`;
    }
    console.log('External:', externals.compatible[k]);
  });

  return {
    entry: path.join(__dirname, '../../webtask'),
    target: 'node',
    output: {
      path: './dist',
      filename: `auth0-box-serverless.extension.${project.version}.js`,
      library: true,
      libraryTarget: 'commonjs2'
    },
    externals: externals.compatible,
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel',
          exclude: path.join(__dirname, '../../node_modules/')
        },
        { test: /\.json$/, loader: 'json' }
      ]
    },
    plugins: [
      new Webpack.IgnorePlugin(/cls-bluebird/, /request-promise/),
      new Webpack.optimize.DedupePlugin(),
      new Webpack.optimize.UglifyJsPlugin({
        minimize: true,
        output: {
          comments: false
        },
        compress: {
          warnings: false
        }
      }),
      new Webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
          CLIENT_VERSION: JSON.stringify(project.version)
        }
      })
    ],
    resolve: {
      modulesDirectories: [ 'node_modules', path.join(__dirname, '../../node_modules/') ],
      root: __dirname,
      alias: {}
    },
    node: false
  };
});

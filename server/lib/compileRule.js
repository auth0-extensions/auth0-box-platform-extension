import ejs from 'ejs';
import config from './config';
import rule from './rules/box-rule';

export default () =>
  ejs.render(rule, {
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    apiKey: config('EXTENSION_SECRET'),
    updateTime: () => new Date().toISOString()
  });

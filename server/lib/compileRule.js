import ejs from 'ejs';
import config from './config';
import rule from './rules/box-rule';

export default () =>
  ejs.render(rule, {
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    apiKey: config('EXTENSION_SECRET'),
    updateTime: () => new Date().toISOString(),
    BOX_CLIENT_ID: config('BOX_CLIENT_ID'),
    BOX_CLIENT_SECRET: config('BOX_CLIENT_SECRET'),
    BOX_ENTERPRISE_ID: config('BOX_ENTERPRISE_ID'),
    BOX_PUBLIC_KEY_ID: config('BOX_PUBLIC_KEY_ID'),
    BOX_SIGNING_CERT: config('BOX_SIGNING_CERT'),
    BOX_SIGNING_CERT_PASSWORD: config('BOX_SIGNING_CERT_PASSWORD')
  });

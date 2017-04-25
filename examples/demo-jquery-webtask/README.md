# Box Platform Extension - jQuery Demo on Webtask

This demo shows how users can authenticate with Auth0 and request an `access_token` for the Box Platform Extension. This extension allows you to exchange the `access_token` for a Box Platform access_token. This demo should be deployed to webtask.

These in turn allow you to interact with the [Box Platform API](https://developer.box.com/reference#api-docs-directory).

## Configuration

 - [Create a new "Single Page Web Application"](https://manage.auth0.com/#/clients) and write down the Auth0 Domain and Client ID
 - Deploy the demo to your Webtask account

```
wt create https://raw.githubusercontent.com/auth0-extensions/auth0-box-platform-extension/master/examples/demo-jquery-webtask/build/webtask.js \
     --no-parse --no-merge --name auth0-box-jquery-demo \
     --secret AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID \
     --secret AUTH0_DOMAIN=YOUR-ACCOUNT.auth0.com \
     --secret BOX_DELEGATION_ENDPOINT="https://YOUR-ACCOUNT.us.webtask.io/auth0-box-platform/delegation"
```

This should give you an url like this one:

> https://wt-sandrino-auth0_com-0.run.webtask.io/auth0-box-jquery-demo

 - Open the Single Page Web Application you created in Auth0 and configure this Webtask url as the Allowed Callback URL
 - Install the Box Platform Extension and configure the Webtask domain as an allowed CORS origin (only the domain, without the path. eg: `https://wt-sandrino-auth0_com-0.run.webtask.io`)
 - Go to the [Box Developer Console](https://app.box.com/developers/console) and enable CORS for this same domain. eg: `https://wt-sandrino-auth0_com-0.run.webtask.io`

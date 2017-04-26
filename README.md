# Auth0 Box Platform Extension

## Running Locally

In order to run this extension locally you'll need to update `./server/config.json` with the following settings:

```json
{
  "API_NAME": "Box Platform API",
  "API_AUDIENCE": "urn:box-platform-api",
  "CORS_WHITELIST": "http://localhost:7001,http://localhost:7002",
  "AUTH0_DOMAIN": "YOUR_DOMAIN.auth0.com",
  "AUTH0_CLIENT_ID": "YOUR_API_V2_CLIENT_ID",
  "AUTH0_CLIENT_SECRET": "YOUR_API_V2_CLIENT_SECRET",
  "BOX_SETTINGS_FILE": "{\n  \"boxAppSettings\": {\...n  \"enterpriseID\": \"111111\"\n}"
}
```

Then run:

```js
yarn install
npm run serve:dev
```

## Usage

![](/media/installation.gif)

 1. Go to the [Box Developer Console](https://app.box.com/developers/console) and go to the **Configuration** tab for your App
 2. Enable "OAuth 2.0 with JWT (Server Authentication)"
 3. Generate a Pubic/Private Keypair
 4. Optionally configure the CORS Domains if you plan to call the Box Platform from the browser (eg: `http://localhost:7001`)
 5. Download the "App Settings" as a JSON file
 6. Authorize the Client ID of your Box Application in the [Admin Console](https://app.box.com/master/settings/openbox)
 7. Install the Extension

Note: if you plan to call the extension from the browser you'll need to configure the `CORS_WHITELIST` with the proper origins, eg: `http://localhost:7001,http://localhost:7002`

After installing the Box Platform Extension you can look at the [examples](/examples) to understand how you can use the Box Platform in combination with Auth0.

### Restricting Access

By default every Client in your Auth0 account is able to request a Box Platform token. If you want to restrict this to specific clients you can create a rule that runs before the `auth0-box-platform` rule:

```js
function (user, context, callback) {
  if (context.clientID === 'YOUR_CLIENT_ID') {
    return callback(null, user, context);
  }

  var boxAudience = 'urn:box-platform-api';
  if (context.request.query && context.request.query.audience === boxAudience) {
    return callback(new UnauthorizedError('Client is not authorized to make this call'));
  }
  if (context.request.body && context.request.body.audience === boxAudience) {
    return callback(new UnauthorizedError('Client is not authorized to make this call'));
  }

  return callback(null, user, context);
}
```

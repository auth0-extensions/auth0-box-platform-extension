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

 1. Go to the [Box Developer Console](https://app.box.com/developers/console) and download the "App Settings" (make sure you generate a key pair first)
 2. Authorize the Client ID of your Box Application in the [Admin Console](https://app.box.com/master/settings/openbox)
 3. Install the Extension

Note: if you plan to call the extension from the browser you'll need to configure the `CORS_WHITELIST` with the proper origins, eg: `http://localhost:7001,http://localhost:7002`

After installing the Box Platform Extension you can look at the [examples](/examples) to understand how you can use the Box Platform in combination with Auth0.

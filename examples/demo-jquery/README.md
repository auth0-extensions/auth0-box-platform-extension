# Box Platform Extension - jQuery Demo

This demo shows how users can authenticate with Auth0 and request an `access_token` for the Box Platform Extension. This extension allows you to exchange the `access_token` for a Box Platform access_token.

These in turn allow you to interact with the [Box Platform API](https://developer.box.com/reference#api-docs-directory).

## Configuration

 1. Install the Box Platform Extension
 2. [Create a new "Single Page Web Application"](https://manage.auth0.com/#/clients)
 3. Configure `http://localhost:7001` as the Allowed Callback URL for this application
 4. Go to the [Box Developer Console](https://app.box.com/developers/console) and enable CORS for `http://localhost:7001`
 5. Update the `config.json` file with the information of your Auth0 Client and the Box Platform Extension:

```
{
  "AUTH0_DOMAIN": "you.auth0.com",
  "AUTH0_CLIENT_ID": "gKYI3eXfKZ.........",
  "BOX_DELEGATION_ENDPOINT": "https://......../delegation"
}
```

## Running the demo

```
npm install
node server
```

Then simply navigate to [http://localhost:7001/](http://localhost:7001/``)

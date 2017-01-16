# Auth0 Box Platform Extension

## Usage

### Configuring your Auth0 account

Start by creating a Client in your Auth0 account. This client will for example represent your iOS app that will upload pictures to the Box platform.

Write down the **Client ID** and **Client Secret** and also if the secret is encoded or not. If you're using RS256 with your client, then only the **Client ID** is required.

### Installation

Go to the [Extensions](https://manage.auth0.com/#/extensions) tab of the dashboard.

![](/media/step1-extensions-overview.png)

Click **CREATE EXTENSION** and install the extension from this repository: https://github.com/auth0-extensions/auth0-box-platform-extension

![](/media/step2-extension-link.png)

Finally enter your Box and Auth0 settings:

 - `AUTH0_AUDIENCE`: The Client ID from the first step.
 - `AUTH0_SECRET`: The Client Secret from the first step if you're using HS256.
 - `AUTH0_SECRET_ENCODED`: If the Client Secret is encoded or not (from step 1).

![](/media/step3-enter-settings.png)

> Note: Make sure your Box private key file is base64 encoded: `cat thefile.pem | base64`

You can now open the extension which will now show instructions on how it can be used:

![](/media/step4-box-platform-homepage.png)

Upon installation a rule is also created in your account which will automatically create a Box Platform user each time a user signs up in your Auth0 account.

![](/media/step5-rule-example.png)

### Flow

First you'll have users signing up to your Auth0 account. When they do, the rule will run and the ID of their respective Box Platform user will be stored in their metadata.

![](/media/step6-signup.png)

Next, your user will login and get an `id_token`. This `id_token` can then be sent to the Webtask endpoint which will return a Box access token.

![](/media/step7-token.png)

Sample Requests:

```bash
# As an example, we can use the Resource Owner endpoint to get an id_token
curl -s "https://box-platform-demo.auth0.com/oauth/ro" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -d 'client_id=fHJhSKk5njWpNhMgrCXI9RR64F1rqzPp&username=sandrino%2Bexample%40auth0.com&password=mypass&grant_type=password&scope=openid+name+email+nickname&connection=Username-Password-Authentication'

# We send the id_token to the Webtask endpoint and get a Box Platform access token back
curl -s 'https://box-platform-demo.us.webtask.io/auth0-box-platform/api/token' \
  -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{ "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9EYzBPRE5FUTBZek5VSTBNRFEzTVVJelJrSTFNMEpDUVVSRU5URXpSRFUyUlVVM1JqZzVPQSJ9.eyJuYW1lIjoic2FuZHJpbm8rZXhhbXBsZUBhdXRoMC5jb20iLCJlbWFpbCI6InNhbmRyaW5vK2V4YW1wbGVAYXV0aDAuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuaWNrbmFtZSI6InNhbmRyaW5vK2V4YW1wbGUiLCJpc3MiOiJodHRwczovL2JveC1wbGF0Zm9ybS1kZW1vLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1ODVjNGE5NDc1NDdmNDJmZTRmOTJjZGYiLCJhdWQiOiJmSEpoU0trNW5qV3BOaE1nckNYSTlSUjY0RjFycXpQcCIsImV4cCI6MTQ4MjQ3OTg4MCwiaWF0IjoxNDgyNDQzODgwfQ.a3_i5GSqaPOjHiy5NAtcrd2Dn5Q1vHwyedrb5QrxjBWFN2KDVCoVrmWYeYsxVPyexisU9u_vM6Bs8fVDTQcFgG8NLpIt1RgFy9dEGWN5rfDiPFppD-MkAQgIjG563f8nwkesYGZPO6QPyNbaU94P1WN1Zq1TaJHz356BWUqEtc8vzjbVt6nLEPgIEZNhIYTqKAE6wrVjHvTe2yDqnH4IaiA0-oeJaY1QEeFusWWScJ6VYxnBmKZRHXKDbRzKfaJwYZDy6CISISTV_tY0epCTG8jwM57P6ERATgch993xrH2Dew2ExyHaB6R9atpyAyoCIp9ZZhWQzvWaIiFIqcV-xw" }'
```

Finally you can use the Box Platform access token to upload files in the context of this user:

```bash
curl https://upload.box.com/api/2.0/files/content \
 -H "Authorization: Bearer ByPpCgZfFfpUf0OUZHusg58rn5M3rtVI" -X POST \
 -F attributes='{"name":"mydata.json", "parent":{"id":"0"}}' \
 -F file=@mydata.json
```

module.exports = `/*
*  This rule been automatically generated by the auth0-box-serverless extension on <%= updateTime() %>
*/
function(user, context, callback) {
   var jws = require('jws');
   user.app_metadata = user.app_metadata || {};
   if (!user.app_metadata.box_id || !user.app_metadata.boxId) {
     var BoxConstants = {
       HEADERS: {
         V2_AUTH_ACCESS: "Bearer"
       },
       DEFAULT_SETTINGS: {
         JWT_EXPIRATION: '10s',
         JWT_ALGORITHM: "RS256",
         JWT_TYPE: "JWT",
         JWT_GRANT_TYPE: "urn:ietf:params:oauth:grant-type:jwt-bearer"
       },
       BASE_URL: "https://api.box.com/oauth2/token",
       APP_USERS_URL: "https://api.box.com/2.0/users",
       ENTERPRISE: "enterprise"
     };

     var BoxConfig = {
       clientId: configuration.clientId,
       clientSecret: configuration.clientSecret,
       enterpriseId: configuration.enterpriseId,
       jwtPublicKeyId: configuration.jwtPublicKeyId
     };

     var cert = new Buffer(configuration.cert, 'base64').toString('ascii');

     var jwtPackage = {
       iss: BoxConfig.clientId,
       aud: BoxConstants.BASE_URL,
       jti: uuid.v4(),
       sub: BoxConfig.enterpriseId,
       box_sub_type: BoxConstants.ENTERPRISE,
       exp: Math.floor(Date.now() / 1000 + 30)
     };

     var token = jws.sign({
       privateKey: cert,
       header: {
         typ: BoxConstants.DEFAULT_SETTINGS.JWT_TYPE,
         kid: BoxConfig.jwtPublicKeyId,
         alg: BoxConstants.DEFAULT_SETTINGS.JWT_ALGORITHM
       },
       payload: jwtPackage
     });

     var formData = {
       grant_type: BoxConstants.DEFAULT_SETTINGS.JWT_GRANT_TYPE,
       client_id: BoxConfig.clientId,
       client_secret: BoxConfig.clientSecret,
       assertion: token
     };

     request.post({ url: BoxConstants.BASE_URL, form: formData }, function(err, resp) {
       if (err) {
         callback(err);
       }

       console.log('Retrieving Enterprise token...'"');

       var enterpriseToken = JSON.parse(resp.body).access_token;
       var options = {
         headers: {
           'Authorization': 'Bearer ' + enterpriseToken
         },
         url: BoxConstants.APP_USERS_URL,
         json: {
           name: user.email,
           is_platform_access_only: true
         }
       };

       request.post(options, function(err, resp) {
         console.log('Creating a new app user...');

         if (err) {
           return callback(err);
         }

         auth0.users.updateAppMetadata(user.user_id, {
           box_id: resp.body.id
         }, function(err, updatedUser) {
           callback(null, updatedUser, context);
         });
       });
     });
   } else {
     callback(null, user, context);
   }
}`;

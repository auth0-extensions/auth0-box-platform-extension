import { UnauthorizedError } from 'auth0-extension-tools';

export default apiKey =>
  (req, res, next) => {
    const header = req.headers['x-api-key'];
    if (header && header === apiKey) {
      req.user = {
        name: 'api-key'
      };
      return next();
    }

    return next(new UnauthorizedError('API key invalid or missing.'));
  };

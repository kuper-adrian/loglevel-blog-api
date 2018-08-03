const jwt = require('jsonwebtoken');
const secrets = require('../services/secrets');
const dbClient = require('../services/db/db-client');
const logger = require('../services/logger').getLogger();

const setAuthInfo = (req, user) => {
  req.loglevel.auth = {
    user,
  };
};

module.exports = /* options => */ (req, res, next) => {
  logger.debug('Entered middleware: parseAuthInfo');

  const authHeader = req.get('Authorization');
  if (!authHeader) {
    logger.debug('no auth header!');
    setAuthInfo(req, undefined);
    next();
    return;
  }

  const parts = authHeader.split('Bearer ');
  if (parts.length !== 2) {
    logger.debug('invalid header content');
    setAuthInfo(req, undefined);
    next();
    return;
  }

  const accessToken = parts[1];
  if (!accessToken) {
    logger.debug('no access token');
    setAuthInfo(req, undefined);
    next();
    return;
  }

  // verify access token
  let jwtPayload = {};
  try {
    jwtPayload = jwt.verify(accessToken, secrets.publicJwtCert, { algorithms: ['RS256'] });
  } catch (err) {
    logger.info('access token invalid!');
    logger.debug(err);
    setAuthInfo(req, undefined);
    next();
    return;
  }

  // valid access token send with request!
  // check if user is in database
  dbClient.doesUserExist(jwtPayload.nick)
    .then((result) => {
      if (result) {
        // user has valid token and exists!
        setAuthInfo(req, jwtPayload.nick);
        next();
      } else {
        setAuthInfo(req, undefined);
        next();
      }
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).send();
    });
};

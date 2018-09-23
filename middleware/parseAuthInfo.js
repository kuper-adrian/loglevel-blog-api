const jwt = require('jsonwebtoken');
const secrets = require('../services/secrets');
const dbClient = require('../services/db/db-client');
const logger = require('../services/logger').getLogger();
const { ApiResult } = require('../models/ApiResult');

const setAuthInfo = (req, user) => {
  req.loglevel.auth = {
    user,
  };
};

/**
 * Middleware that handles authentication (but not authorization!).
 *
 * @param {object} req express request object
 * @param {object} res express respose object
 * @param {object} next express next handler
 */
module.exports = /* options => */ (req, res, next) => {
  logger.debug('Entered middleware: parseAuthInfo');

  // check if Authorization header was set...
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    // ... if not, user is not authenticated
    logger.debug('no auth header!');
    setAuthInfo(req, undefined);
    next();
    return;
  }

  // check if auth header contents are valid
  const parts = authHeader.split('Bearer ');
  if (parts.length !== 2) {
    logger.debug('invalid header content');
    setAuthInfo(req, undefined);
    next();
    return;
  }

  // check for token
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
    logger.debug(err.message);
    setAuthInfo(req, undefined);
    next();
    return;
  }

  // valid access token send with request!
  // check if user is in database
  dbClient.getUserByNickname(jwtPayload.nick)
    .then((user) => {
      if (user) {
        // user has valid token and exists => user is authenticated!
        setAuthInfo(req, user);
        next();
      } else {
        setAuthInfo(req, undefined);
        next();
      }
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json(new ApiResult(false));
    });
};

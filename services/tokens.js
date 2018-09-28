const dbClient = require('./db/db-client');
const jwt = require('jsonwebtoken');
const uuidv1 = require('uuid/v1');
const moment = require('moment');
const secrets = require('./secrets');
const logger = require('./logger').getLogger();

exports.generateNewTokens = (user) => {
  if (!user) {
    return Promise.reject(new Error('No "user" parameter'));
  }
  if (!user.nickname) {
    return Promise.reject(new Error('No nickname given for "user" object'));
  }

  let accessToken = '';
  let refreshToken = '';

  accessToken = jwt.sign(
    {
      name: user.nickname,
    },
    secrets.privateJwtKey,
    {
      algorithm: 'RS256',
      expiresIn: '1 minutes',
    },
  );

  refreshToken = uuidv1();
  // add token to database
  return dbClient.saveRefreshToken(refreshToken, user.id)
    .then(() => {
      const tokens = { accessToken, refreshToken };
      return tokens;
    });
};

exports.isRefreshTokenValid = (nickname, refreshToken) => {
  let user = {};

  return dbClient.getUserByNickname(nickname)
    .then((result) => {
      if (!result) {
        return null;
      }
      user = result;

      return dbClient.getRefreshToken(user.id);
    })

    .then((dbToken) => {
      if (!dbToken) {
        return null;
      }

      if (dbToken.uuid !== refreshToken) {
        return null;
      }

      const currentTime = moment();
      const expirationDate = moment(dbToken.expires);

      if (expirationDate.isAfter(currentTime)) {
        return user;
      }
      return null;
    })

    .catch((error) => {
      logger.error(error);
      return null;
    });
};

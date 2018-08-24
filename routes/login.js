const express = require('express');
const dbClient = require('../services/db/db-client');
const tokenService = require('../services/tokens');
const logger = require('../services/logger').getLogger();
const { BreakError, FaultError } = require('../models/BreakErrors');
const { ApiResult } = require('../models/ApiResult');

const router = express.Router();

router.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    const result = new ApiResult(false, 'Username and password required!');
    res.status(400).json(result);
    return;
  }

  dbClient.getRegisteredUser(req.body.username, req.body.password)
    .then((user) => {
      if (!user) {
        return Promise.reject(new FaultError('invalid credentials', 401));
      }
      return tokenService.generateNewTokens(user);
    })

    .then((tokens) => {
      if (tokens) {
        // refresh token is saved in database!
        // send tokens to client
        const result = new ApiResult(true, '', tokens);
        res.status(200).json(result);
      }
    })

    .catch((error) => {
      if (error instanceof FaultError) {
        logger.info(error.message);
        res.status(error.httpStatus).json(new ApiResult(false, error.message));
      } else if (error instanceof BreakError) {
        logger.info(error.message);
        res.status(400).json(new ApiResult(false, error.message));
      } else {
        logger.error(error);
        res.status(500).json(new ApiResult(false));
      }
    });
});

module.exports = router;

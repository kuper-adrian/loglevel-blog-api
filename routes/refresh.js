const express = require('express');
const tokenService = require('../services/tokens');
const logger = require('../services/logger').getLogger();
const { FaultError } = require('../models/BreakErrors');

const router = express.Router();

router.route('/refresh')
  .post((req, res) => {
    if (!req.body.username || !req.body.refreshToken) {
      res.send(400).send('username and refresh token required');
      return;
    }

    const { username, refreshToken } = req.body;

    // check if refresh token is still valid and belongs to passed username
    tokenService.isRefreshTokenValid(username, refreshToken)
      .then((user) => {
        if (!user) {
          return Promise.reject(new FaultError('Invalid refresh token', 401));
        }
        return tokenService.generateNewTokens(user);
      })

      .then((tokens) => {
        res.status(200).json(tokens);
      })

      .catch((error) => {
        if (error instanceof FaultError) {
          logger.info(error.message);
          res.status(error.httpStatus).send(error.message);
        } else {
          logger.error(error);
          res.status(500).send();
        }
      });
  });

module.exports = router;

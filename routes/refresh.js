const express = require('express');
const tokenService = require('../services/tokens');
const logger = require('../services/logger').getLogger();

const router = express.Router();

router.route('/refresh')
  .post((req, res) => {
    if (!req.body.username || !req.body.refreshToken) {
      res.send(400).send('username and refresh token required');
    }

    const { username, refreshToken } = req.body;

    // check if refresh token is still valid and belongs to passed username
    tokenService.isRefreshTokenValid(username, refreshToken)
      .then((user) => {
        if (!user) {
          res.status(401).send('invalid refresh token');
          return Promise.reject(new Error('Invalid refresh token'));
        }

        return tokenService.generateNewTokens(user);
      })

      .then((tokens) => {
        res.status(200).json(tokens);
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).send();
      });
  });

module.exports = router;

const express = require('express');
const dbClient = require('../services/db/db-client');
const tokenService = require('../services/tokens');
const logger = require('../services/logger').getLogger();
const { FaultError } = require('../models/BreakErrors');

const router = express.Router();

router.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(400).send('Username and password required!');
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
        res.status(200).json(tokens);
      }
    })

    .catch((error) => {
      if (error instanceof FaultError) {
        logger.info(error.message);
        res.status(error.httpStatus).send(error.message);
      } else {
        logger.error(error.message);
        res.status(500).send();
      }
    });
});

module.exports = router;

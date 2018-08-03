const express = require('express');
const dbClient = require('../services/db/db-client');
const tokenService = require('../services/tokens');
const logger = require('../services/logger').getLogger();

const router = express.Router();

router.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(400).send('Username and password required!');
  }

  dbClient.getRegisteredUser(req.body.username, req.body.password)
    .then((user) => {
      if (!user) {
        res.status(401).send('invalid credentials');
        return Promise.resolve(null);
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
      logger.info(error.message);
      res.status(500).send();
    });
});

module.exports = router;

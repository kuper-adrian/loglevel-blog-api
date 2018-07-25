const express = require('express');
const dbClient = require('../services/db/db-client');
const jwt = require('jsonwebtoken');
const uuidv1 = require('uuid/v1');
const secrets = require('../services/secrets');

const router = express.Router();


router.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(401).send('Username and password required!');
  }

  let accessToken = {};
  let refreshToken = {};

  dbClient.getRegisteredUser(req.body.username, req.body.password)
    .then((user) => {
      if (user) {
        accessToken = jwt.sign(
          {
            nick: user.nickname,
          },
          secrets.privateJwtKey,
          {
            algorithm: 'RS256',
            expiresIn: '10 minutes',
          },
        );

        refreshToken = uuidv1();
        // add token to database
        return dbClient.saveRefreshToken(refreshToken, user.id);
      }

      res.status(401).send('invalid credentials');
      return Promise.reject(new Error('Invalid credentials passed'));
    })

    .then(() => {
      // refresh token is saved in database!
      // send tokens to client
      res.status(200).json({
        accessToken,
        refreshToken,
      });
    })

    .catch((error) => {
      console.log(error.message);
    });
});

module.exports = router;

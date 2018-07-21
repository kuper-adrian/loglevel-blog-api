const express = require('express');
const dbClient = require('../middleware/db/db-client');
const jwt = require('jsonwebtoken');
const uuidv5 = require('uuid/v5');


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
        // TODO handle signing secret
        accessToken = jwt.sign({ nick: user.nickname }, 'shhhhh');

        if (!guidNamespace) {
          // get namespace from db
        }

        // TODO create GUID for refresh token
        // add token to database
      } else {
        res.status(401).send('invalid credentials');
      }
    });
});

module.exports = router;

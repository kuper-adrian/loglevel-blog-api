const jwt = require('jsonwebtoken');
const secrets = require('../services/secrets');
const dbClient = require('../services/db/db-client');

module.exports = /* options => */ (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    console.log('no auth header!');
    res.status(401).send();
    return;
  }

  const parts = authHeader.split('Bearer ');
  if (parts.length !== 2) {
    console.log('invalid header content');
    res.status(401).send();
    return;
  }

  const accessToken = parts[1];
  if (!accessToken) {
    console.log('no access token');
    res.status(401).send();
    return;
  }

  // verify access token
  let jwtPayload = {};
  try {
    jwtPayload = jwt.verify(accessToken, secrets.publicJwtCert, { algorithms: ['RS256'] });
  } catch (err) {
    console.log('access token invalid!');
    console.log(err);
    res.status(401).send();
    return;
  }

  // valid access token send with request!
  // check if user is in database
  dbClient.doesUserExist(jwtPayload.nick)
    .then((result) => {
      if (result) {
        // TODO: if more than one users can register: add permission check by
        // using options parameter
        next();
      } else {
        console.log('unknown user');
        res.status(401).send();
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
};

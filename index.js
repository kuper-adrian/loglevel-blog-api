const express = require('express');
const bodyParser = require('body-parser');
const commandLineArgs = require('command-line-args');

const secrets = require('./services/secrets');
const dbClient = require('./services/db/db-client');
const logger = require('./services/logger').getLogger();

const logRequest = require('./middleware/logRequest');
const prepareRequest = require('./middleware/prepareRequest');
const parseAuthInfo = require('./middleware/parseAuthInfo');

const postRouter = require('./routes/post');
const loginRouter = require('./routes/login');
const refreshRouter = require('./routes/refresh');

const api = express();
const PORT = 9002;
const apiVersionSubPath = '/v1';


const cmdArgDefinitions = [
  { name: 'user', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },
];

const cmdArgs = commandLineArgs(cmdArgDefinitions);

api.use(bodyParser.json());

api.use(logRequest);
api.use(prepareRequest);
api.use(parseAuthInfo);

api.use(apiVersionSubPath, postRouter);
api.use(apiVersionSubPath, loginRouter);
api.use(apiVersionSubPath, refreshRouter);

// send 404 for all other requests
api.get('*', (req, res) => {
  res.status(404).send('not found');
});

dbClient.init({ nickname: cmdArgs.user, password: cmdArgs.password })
  .then(() => {
    secrets.init();

    api.listen(PORT, () => {
      logger.info(`running ${apiVersionSubPath} on port ${PORT}`);
    });
  })

  .catch((error) => {
    logger.error('Initialisation failed!');
    logger.error(error);
  });

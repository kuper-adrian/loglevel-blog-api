const express = require('express');
const bodyParser = require('body-parser');
const commandLineArgs = require('command-line-args');

const secrets = require('./services/secrets');
const dbClient = require('./middleware/db/db-client');

const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const loginRouter = require('./routes/login');

const api = express();
const PORT = 9002;
const apiVersionSubPath = '/v1';


const cmdArgDefinitions = [
  { name: 'user', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },
];

const cmdArgs = commandLineArgs(cmdArgDefinitions);

api.use(bodyParser.json());

api.use(apiVersionSubPath, userRouter);
api.use(apiVersionSubPath, postRouter);
api.use(apiVersionSubPath, loginRouter);

// send 404 for all other requests
api.get('*', (req, res) => {
  res.status(404).send('not found');
});

dbClient.init({ nickname: cmdArgs.user, password: cmdArgs.password })
  .then(() => {
    secrets.init();

    api.listen(PORT, () => {
      console.log(`running ${apiVersionSubPath} on port ${PORT}`);
    });
  })

  .catch((error) => {
    console.log('Initialisation failed!');
    console.log(error.message);
  });

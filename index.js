const express = require('express');
// const commandLineArgs = require('command-line-args')

const dbClient = require('./middleware/db/db-client');

const userRouter = require('./routes/user');
const postRouter = require('./routes/post');

const api = express();
const PORT = 9002;
const apiVersionSubPath = '/v1';


// const cmdArgDefinitions = [
//   { name: 'user', alias: 'u', type: String },
//   { name: 'password', alias: 'p', type: String },
// ];

// const cmdArgs = commandLineArgs(cmdArgDefinitions);

// console.log(cmdArgs.user);
// console.log(cmdArgs.password);

api.use(apiVersionSubPath, userRouter);
api.use(apiVersionSubPath, postRouter);

dbClient.init()
  .then(() => {
    api.listen(PORT, () => {
      console.log(`running ${apiVersionSubPath} on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Initialisation failed!');
    console.log(error.message);
  });

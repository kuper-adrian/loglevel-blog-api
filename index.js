const express = require('express');

const api = express();
const PORT = 9002;
const apiVersionSubPath = '/v1';

const userRouter = require('./routes/user');
const postRouter = require('./routes/post');

api.use(apiVersionSubPath, userRouter);
api.use(apiVersionSubPath, postRouter);

api.listen(PORT, () => {
  console.log(`running v1 on port ${PORT}`)
});

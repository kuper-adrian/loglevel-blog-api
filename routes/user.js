var express = require('express');
var router = express.Router();

router.route('/user')
  .get((request, response) => {
    console.log('user get');
    response.send('get user');
  })

  .post((request, response) => {
    console.log('user post');
    response.send('post user');
  })

  .put((request, response) => {
    console.log('user put');
    response.send('put user');
  })

  .delete((request, response) => {
    console.log('user delete');
    response.send('delete user');
  });

module.exports = router;

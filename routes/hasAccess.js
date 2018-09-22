const express = require('express');
const checkAccess = require('../middleware/checkAccess');
const { ApiResult } = require('../models/ApiResult');

const router = express.Router();

/**
 * Convenience route to check if the user is authenticated and authorized.
 */
router.route('/hasAccess')
  .get(checkAccess, (req, res) => {
    res.json(new ApiResult(true));
  });

module.exports = router;

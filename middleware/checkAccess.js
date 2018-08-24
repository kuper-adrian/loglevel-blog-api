const logger = require('../services/logger').getLogger();
const { ApiResult } = require('../models/ApiResult');

module.exports = /* options => */ (req, res, next) => {
  logger.debug('Entered middleware: checkAccess');

  // check fields populated by parseAuthInfo middleware
  if (!req.loglevel.auth.user) {
    logger.debug('Unauthorized');
    res.status(401).json(new ApiResult(false, 'Unauthorized'));
    return;
  }
  // TODO: if more than one users can register: add permission check by
  // using options parameter and send 403 if permission is missing
  next();
};

const logger = require('../services/logger').getLogger();

module.exports = /* options => */ (req, res, next) => {
  logger.debug('Entered middleware: checkAccess');

  if (!req.loglevel.auth.user) {
    res.status(401).send();
    return;
  }
  // TODO: if more than one users can register: add permission check by
  // using options parameter and send 403 if permission is missing
  next();
};

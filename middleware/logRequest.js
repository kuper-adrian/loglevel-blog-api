const logger = require('../services/logger').getLogger();

module.exports = (req, res, next) => {
  const logMessage = `Path: "${req.path}", Method: ${req.method}`;
  logger.debug(logMessage);
  next();
};

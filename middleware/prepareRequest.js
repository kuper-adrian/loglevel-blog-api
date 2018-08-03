const logger = require('../services/logger').getLogger();

/**
 * Middleware that adds loglevel-blog specific property to request to safely
 * add infos to request without overriding existing properties.
 */
module.exports = (req, res, next) => {
  logger.debug('Entered middleware: prepareRequest');

  req.loglevel = {};
  next();
};

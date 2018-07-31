
/**
 * Middleware that adds loglevel-blog specific property to request to safely
 * add infos to request without overriding existing properties.
 */
module.exports = (req, res, next) => {
  console.log('Entered middleware: prepareRequest');

  req.loglevel = {};
  next();
};

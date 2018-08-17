/* eslint valid-typeof: 0 */

const logger = require('../services/logger').getLogger();

const validate = (schema, object) => {
  let isValid = true;

  const keys = Object.keys(schema);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (!isValid) break;

    const schemaProp = schema[key];
    const objectProp = object[key];

    const isOptional = schemaProp.optional ? schemaProp.optional : false;
    const propExists = objectProp !== undefined && objectProp !== null;

    if (!propExists) {
      isValid = isOptional;
    } else if (schemaProp.type === 'array') {
      // object property has to be array
      if (!Array.isArray(objectProp)) {
        isValid = false;
      } else if (schemaProp.itemType.type === 'object') { // if prop is array, check array items
        for (let index = 0; index < objectProp.length; index += 1) {
          const item = objectProp[index];
          isValid = isValid && validate(schemaProp.itemType.schema, item);
          if (!isValid) break;
        }
      } else {
        for (let index = 0; index < objectProp.length; index += 1) {
          const item = objectProp[index];
          isValid = isValid && typeof item === schemaProp.itemType.type;
          if (!isValid) break;
        }
      }
    } else if (schemaProp.type === 'object') {
      isValid = validate(schemaProp.schema, objectProp);
    } else {
      isValid = typeof objectProp === schemaProp.type;
    }
  }

  return isValid;
};

module.exports = options => (req, res, next) => {
  logger.debug('Entered middleware: validateBody');

  if (!options || !options.schema) {
    res.status(500).send('no schema provided for validation');
    return;
  }

  const { schema } = options;
  const { body } = req;

  try {
    logger.debug('starting validation');

    if (validate(schema, body)) {
      logger.debug('validation successful!');
      next();
    } else {
      logger.debug('validation failed');

      const answer = {
        success: false,
        message: 'invalid request body',
        requiredBodySchema: schema,
      };
      res.status(400).json(answer);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send('body validation failed');
  }
};

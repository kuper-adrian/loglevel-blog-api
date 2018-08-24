const express = require('express');
const checkAccess = require('../middleware/checkAccess');
const dbClient = require('../services/db/db-client');
const logger = require('../services/logger').getLogger();
const { BreakError } = require('../models/BreakErrors');
const { ApiResult } = require('../models/ApiResult');

const router = express.Router();

router.route('/tag')
  .get((req, res) => {
    // get tags from database ...
    dbClient.getTags()
      .then((tags) => {
        // ... and return them
        res.status(200).json(new ApiResult(true, '', tags));
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).json(new ApiResult(false));
      });
  })

  .post(checkAccess, (req, res) => {
    const { tagName } = req.body;

    if (tagName === undefined || tagName === null || typeof tagName !== 'string') {
      logger.info(`invalid tag name '${tagName}'`);
      res.status(400).json(new ApiResult(false, 'invalid tag name'));
      return;
    }

    dbClient.insertTag(tagName)
      .then((rowCount) => {
        if (rowCount === 0) {
          logger.info('No new tags added...');
          res.status(400).json(new ApiResult(false, 'No tags saved'));
        } else {
          res.status(200).json(new ApiResult(true, `Tag '${tagName}' successfully created!`));
        }
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).json(new ApiResult(false, error.message));
        } else {
          res.status(500).json(new ApiResult(false, `Unable to save tag '${tagName}'`));
        }
      });
  })

  .delete(checkAccess, (req, res) => {
    const { tagId } = req.body;

    if (tagId === undefined || tagId === null || typeof tagId !== 'number') {
      logger.info(`invalid tag id '${tagId}'`);
      res.status(401).json(new ApiResult(false, 'invalid tag id'));
      return;
    }

    dbClient.deleteTag(tagId)
      .then((rowCount) => {
        if (rowCount === 0) {
          res.status(200).json(new ApiResult(true, `No tag found under id '${tagId}'. No tags deleted.`));
        } else {
          res.status(200).json(new ApiResult(true, 'Tag deleted'));
        }
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).json(new ApiResult(false, 'Could not delete tag'));
      });
  });

module.exports = router;

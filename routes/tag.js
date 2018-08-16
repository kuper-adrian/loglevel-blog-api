const express = require('express');
const checkAccess = require('../middleware/checkAccess');
const dbClient = require('../services/db/db-client');
const logger = require('../services/logger').getLogger();
const { BreakError } = require('../models/BreakErrors');

const router = express.Router();

router.route('/tag')
  .get((req, res) => {
    // get tags from database ...
    dbClient.getTags()
      .then((tags) => {
        // ... and return them
        res.status(200).send(tags);
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).send();
      });
  })

  .post(checkAccess, (req, res) => {
    const { tagName } = req.body;

    if (tagName === undefined || tagName === null || typeof tagName !== 'string') {
      logger.info(`invalid tag name '${tagName}'`);
      res.status(400).send('invalid tag name');
      return;
    }

    dbClient.insertTag(tagName)
      .then((rowCount) => {
        if (rowCount === 0) {
          logger.info('No new tags added...');
          res.status(400).send('No tags saved');
        } else {
          res.status(200).send(`Tag '${tagName}' successfully created!`);
        }
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).send(error.message);
        } else {
          res.status(500).send(`Unable to save tag '${tagName}'`);
        }
      });
  })

  .delete(checkAccess, (req, res) => {
    const { tagId } = req.body;

    if (tagId === undefined || tagId === null || typeof tagId !== 'number') {
      logger.info(`invalid tag id '${tagId}'`);
      res.status(401).send('invalid tag id');
      return;
    }

    dbClient.deleteTag(tagId)
      .then((rowCount) => {
        if (rowCount === 0) {
          res.status(200).send(`No tag found under id '${tagId}'. No tags deleted.`);
        } else {
          res.status(200).send('Tag deleted');
        }
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).send('Could not delete tag');
      });
  });

module.exports = router;

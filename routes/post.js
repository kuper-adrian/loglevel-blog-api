/* eslint no-param-reassign: ["error", { "props": false }] */

const express = require('express');
const { Base64 } = require('js-base64');
const checkAccess = require('../middleware/checkAccess');
const dbClient = require('../services/db/db-client');
const logger = require('../services/logger').getLogger();

const router = express.Router();

router.route('/post/:id')

  .get((req, res) => {
    const postId = req.params.id;

    dbClient.getBlogPostById(postId)
      .then((blogPost) => {
        blogPost.actions = {};

        // if user is authenticated, add possible actions
        if (req.loglevel.auth.user) {
          blogPost.actions = {
            update: {
              href: `post/${postId}`,
              type: 'PUT',
            },
            delete: {
              href: `post/${postId}`,
              type: 'DELETE',
            },
          };
        }

        res.status(200).json(blogPost);
      })

      .catch((error) => {
        logger.error(error);
        res.status(200).send(error.message);
      });
  })

  .put(checkAccess, (req, res) => {
    const postId = req.params.id;
    // TODO get json from body and update database
    res.send('put post');
  })

  .delete(checkAccess, (req, res) => {
    const postId = req.params.id;
    // TODO delete blog post from database
    res.send('delete post');
  });

router.route('/post')

  .get((req, res) => {
    // TODO change result based on req.query.page
    // TODO db access

    dbClient.getBlogPostPreviews(0, 5)
      .then((previews) => {
        previews.forEach((preview) => {
          // add actions
          preview.actions = {
            read: {
              href: `post/${preview.id}`,
              method: 'GET',
            },
          };

          // add actions for authnticated users
          if (req.loglevel.auth.user) {
            preview.actions.update = {
              href: `post/${preview.id}`,
              method: 'PUT',
            };
            preview.actions.delete = {
              href: `post/${preview.id}`,
              method: 'DELETE',
            };
          }
        });

        res.status(200).send(previews);
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).send();
      });
  });

module.exports = router;

/* eslint no-param-reassign: ["error", { "props": false }] */

const express = require('express');
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
    res.send('TODO put blog post');
  })

  .delete(checkAccess, (req, res) => {
    const postId = req.params.id;
    if (!postId) {
      res.status(400).send('no post id given');
      return;
    }

    dbClient.deleteBlogPost(postId)
      .then((count) => {
        // check if a blog post was actually deleted or not
        if (count === 0) {
          logger.debug('no posts found');
          res.status(200).send('post not found');
        } else {
          res.status(200).send('Post successfully deleted');
        }
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).send('Unable to delete post');
      });
  });

router.route('/post')

  .get((req, res) => {
    const page = !req.query.page ? 0 : Number(req.query.page);
    const pageSize = 5;
    logger.debug(`get page ${page}, size ${pageSize}`);

    dbClient.getBlogPostPreviews(page, pageSize)
      .then((result) => {
        const previousPageExists = page > 0;
        const nextPageExists = pageSize + (pageSize * page) < result.blogPostTotal;

        result.actions = {};

        if (previousPageExists) {
          result.actions.previous = {
            href: `post?page=${page - 1}`,
            method: 'GET',
          };
        }

        if (nextPageExists) {
          result.actions.next = {
            href: `post?page=${page + 1}`,
            method: 'GET',
          };
        }

        result.previews.forEach((preview) => {
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

        res.status(200).send(result);
      })

      .catch((error) => {
        logger.error(error);
        res.status(500).send();
      });
  });

module.exports = router;

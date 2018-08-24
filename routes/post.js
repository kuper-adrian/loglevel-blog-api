/* eslint no-param-reassign: ["error", { "props": false }] */

const express = require('express');

const checkAccess = require('../middleware/checkAccess');
const validateBody = require('../middleware/validateBody');

const dbClient = require('../services/db/db-client');
const logger = require('../services/logger').getLogger();

const { BreakError } = require('../models/BreakErrors');
const { ApiResult } = require('../models/ApiResult');

const router = express.Router();

// schema, that objects passed to put route have to satisfy
const PUT_BODY_SCHEMA = {
  title: {
    type: 'string',
    optional: true,
  },
  plug: {
    type: 'string',
    optional: true,
  },
  text: {
    type: 'string',
    optional: true,
  },
  tags: {
    type: 'array',
    optional: true,
    itemType: {
      type: 'object',
      schema: {
        id: {
          type: 'number',
        },
        name: {
          type: 'string',
        },
      },
    },
  },
};

// schema, that objects passed to post route have to satisfy
const POST_BODY_SCHEMA = {
  title: {
    type: 'string',
  },
  plug: {
    type: 'string',
  },
  text: {
    type: 'string',
  },
  tags: {
    type: 'array',
    itemType: {
      type: 'object',
      schema: {
        id: {
          type: 'number',
        },
        name: {
          type: 'string',
        },
      },
    },
  },
};

router.route('/post/:id')

  .get((req, res) => {
    const postId = req.params.id;

    dbClient.getBlogPostById(postId)
      .then((blogPost) => {
        const result = {
          id: blogPost.id,
          title: blogPost.title,
          publishedAt: blogPost.published,
          plug: blogPost.plug,
          text: blogPost.text,
          tags: blogPost.tags,
          author: {
            name: `${blogPost.firstName} ${blogPost.lastName}`,
          },
          actions: {},
        };

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

        res.status(200).json(new ApiResult(true, '', result));
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).json(new ApiResult(false, error.message));
        } else {
          logger.error(error);
          res.status(500).json(new ApiResult(false, 'Unable to blog post'));
        }
      });
  })

  .put(checkAccess, validateBody({ schema: PUT_BODY_SCHEMA }), (req, res) => {
    const postId = req.params.id;
    const blogPost = req.body;

    // add infos to blogPost object
    blogPost.id = Number(postId);
    blogPost.author = {
      id: req.loglevel.auth.user.id,
    };

    dbClient.updateBlogPost(blogPost)
      .then(() => {
        logger.info('Blog post added!');
        res.status(200).json(new ApiResult(true, 'Blog post updated successfully!'));
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).json(new ApiResult(false, error.message));
        } else {
          logger.error(error);
          res.status(500).json(new ApiResult(false, 'Unable to update blog post'));
        }
      });
  })

  .delete(checkAccess, (req, res) => {
    const postId = req.params.id;
    if (!postId) {
      res.status(400).json(new ApiResult(false, 'no post id given'));
      return;
    }

    dbClient.deleteBlogPost(postId)
      .then((count) => {
        // check if a blog post was actually deleted or not
        if (count === 0) {
          logger.debug('no posts found');
          res.status(400).json(new ApiResult(false, 'post not found'));
        } else {
          res.status(200).json(new ApiResult(true, 'Post successfully deleted'));
        }
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).json(new ApiResult(false, error.message));
        } else {
          logger.error(error);
          res.status(500).json(new ApiResult(false, 'Unable to delete blog post'));
        }
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

          // add actions for authenticated users
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

        res.status(200).json(new ApiResult(true, '', result));
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).json(new ApiResult(false, error.message));
        } else {
          logger.error(error);
          res.status(500).json(new ApiResult(false, 'Unable to get blog posts'));
        }
      });
  })

  .post(checkAccess, validateBody({ schema: POST_BODY_SCHEMA }), (req, res) => {
    // getting here means:
    // - valid post object in request body
    // - user is authenticated and authorized

    logger.info(`request to add blog post: ${JSON.stringify(req.body)}`);

    const blogPost = req.body;
    blogPost.author = {
      nickname: req.loglevel.auth.user.nickname,
    };

    dbClient.insertBlogPost(blogPost)
      .then(() => {
        logger.info();
        res.status(200).json(new ApiResult(true, 'Successfully created blog post!'));
      })

      .catch((error) => {
        if (error instanceof BreakError) {
          logger.info(error);
          res.status(400).json(new ApiResult(false, error.message));
        } else {
          logger.error(error);
          res.status(500).json(new ApiResult(false, 'Unable to create blog post.'));
        }
      });
  });

module.exports = router;

/* eslint no-param-reassign: ["error", { "props": false }] */

const express = require('express');
const { Base64 } = require('js-base64');
const checkAccess = require('../middleware/checkAccess');
const dbClient = require('../services/db/db-client');

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
            edit: {
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

    const dummyEntries = [
      {
        type: 'post-preview',
        post: {
          id: 1,
          title: 'Some stub blog entry 1',
          plug: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Placerat orci nulla pellentesque dignissim enim. Nunc scelerisque viverra mauris in aliquam sem fringilla ut. Et leo duis ut diam. Cum sociis natoque penatibus et magnis dis. Felis eget velit aliquet sagittis id. Cras ornare arcu dui vivamus arcu felis bibendum ut. Ornare lectus sit amet est placerat in. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Risus pretium quam vulputate dignissim suspendisse in est ante. Pharetra massa massa ultricies mi quis hendrerit dolor. Blandit turpis cursus in hac habitasse platea dictumst.',
          tags: [
            'javascript',
            'testing',
          ],
          publishedAt: '2018-05-15T13:37:42Z',
          author: {
            name: 'Adrian Kuper',
            link: '/user/1',
          },
          link: '/post/1',
        },
      },
      {
        type: 'post-preview',
        post: {
          id: 2,
          title: 'Some stub blog entry 2',
          plug: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Placerat orci nulla pellentesque dignissim enim. Nunc scelerisque viverra mauris in aliquam sem fringilla ut. Et leo duis ut diam. Cum sociis natoque penatibus et magnis dis. Felis eget velit aliquet sagittis id. Cras ornare arcu dui vivamus arcu felis bibendum ut. Ornare lectus sit amet est placerat in. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Risus pretium quam vulputate dignissim suspendisse in est ante. Pharetra massa massa ultricies mi quis hendrerit dolor. Blandit turpis cursus in hac habitasse platea dictumst.',
          tags: [
            'c#',
            'wpf',
          ],
          publishedAt: '2018-05-08T13:37:42Z',
          author: {
            name: 'Adrian Kuper',
            link: '/user/1',
          },
          link: '/post/2',
        },
      },
      {
        type: 'post-preview',
        post: {
          id: 3,
          title: 'Some stub blog entry 3',
          plug: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Placerat orci nulla pellentesque dignissim enim. Nunc scelerisque viverra mauris in aliquam sem fringilla ut. Et leo duis ut diam. Cum sociis natoque penatibus et magnis dis. Felis eget velit aliquet sagittis id. Cras ornare arcu dui vivamus arcu felis bibendum ut. Ornare lectus sit amet est placerat in. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Risus pretium quam vulputate dignissim suspendisse in est ante. Pharetra massa massa ultricies mi quis hendrerit dolor. Blandit turpis cursus in hac habitasse platea dictumst.',
          tags: [
            'continuous integration',
            'jenkins',
          ],
          publishedAt: '2018-06-15T13:37:42Z',
          author: {
            name: 'Adrian Kuper',
            link: '/user/1',
          },
          link: '/post/3',
        },
      },
    ];

    res.json(dummyEntries);
  });

module.exports = router;

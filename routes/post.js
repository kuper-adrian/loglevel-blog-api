var express = require('express');
var router = express.Router();

router.route('/post/:id')

  .get((request, response) => {
    console.log('post get');
    console.log(request.params.id);
    console.log(request.params.test);
    response.send('get post');
  })

  .post((request, response) => {
    console.log('post post');
    response.send('post post');
  })

  .put((request, response) => {
    console.log('post put');
    response.send('put post');
  })

  .delete((request, response) => {
    console.log('post delete');
    response.send('delete post');
  });

  router.route('/post')

  .get((req, res) => {
    console.log("hei")
    // change result based on req.query.page

    const dummyEntries = [
      {
        type: "post-preview",
        post: {
          title: "Some stub blog entry 1",
          plug: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Placerat orci nulla pellentesque dignissim enim. Nunc scelerisque viverra mauris in aliquam sem fringilla ut. Et leo duis ut diam. Cum sociis natoque penatibus et magnis dis. Felis eget velit aliquet sagittis id. Cras ornare arcu dui vivamus arcu felis bibendum ut. Ornare lectus sit amet est placerat in. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Risus pretium quam vulputate dignissim suspendisse in est ante. Pharetra massa massa ultricies mi quis hendrerit dolor. Blandit turpis cursus in hac habitasse platea dictumst.",
          tags: [
            "javascript",
            "testing"
          ],
          publishedAt: "2018-05-15T13:37:42Z",
          author: {
            name: "Adrian Kuper",
            link: "/user/1"
          },
          link: "/post/1"
        }
      },
      {
        type: "post-preview",
        post: {
          title: "Some stub blog entry 2",
          plug: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Placerat orci nulla pellentesque dignissim enim. Nunc scelerisque viverra mauris in aliquam sem fringilla ut. Et leo duis ut diam. Cum sociis natoque penatibus et magnis dis. Felis eget velit aliquet sagittis id. Cras ornare arcu dui vivamus arcu felis bibendum ut. Ornare lectus sit amet est placerat in. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Risus pretium quam vulputate dignissim suspendisse in est ante. Pharetra massa massa ultricies mi quis hendrerit dolor. Blandit turpis cursus in hac habitasse platea dictumst.",
          tags: [
            "c#",
            "wpf"
          ],
          publishedAt: "2018-05-08T13:37:42Z",
          author: {
            name: "Adrian Kuper",
            link: "/user/1"
          },
          link: "/post/2"
        }
      },
      {
        type: "post-preview",
        post: {
          title: "Some stub blog entry 3",
          plug: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Placerat orci nulla pellentesque dignissim enim. Nunc scelerisque viverra mauris in aliquam sem fringilla ut. Et leo duis ut diam. Cum sociis natoque penatibus et magnis dis. Felis eget velit aliquet sagittis id. Cras ornare arcu dui vivamus arcu felis bibendum ut. Ornare lectus sit amet est placerat in. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Risus pretium quam vulputate dignissim suspendisse in est ante. Pharetra massa massa ultricies mi quis hendrerit dolor. Blandit turpis cursus in hac habitasse platea dictumst.",
          tags: [
            "continuous integration",
            "jenkins"
          ],
          publishedAt: "2018-06-15T13:37:42Z",
          author: {
            name: "Adrian Kuper",
            link: "/user/1"
          },
          link: "/post/3"
        }
      }
    ]
    
    res.json(dummyEntries);
  });

module.exports = router;

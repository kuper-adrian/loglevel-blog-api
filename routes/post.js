var express = require('express');
var router = express.Router();
const Base64 = require('js-base64').Base64;

router.route('/post/:id')

  .get((req, res) => {
    console.log('post get');

    const stubAsciiDoc = `
Try AsciiDoc
------------

There is _no reason_ to prefer http://daringfireball.net/projects/markdown/[Markdown]:
it has *all the features*
footnote:[See http://asciidoc.org/userguide.html[the user guide].]
and more!

NOTE: Great projects use it, including Git, WeeChat and Pacman!

=== Comparison

=== Ruby code to render AsciiDoc

[source,javascript]
----
var foo = "some variable"; // some comment
console.log(foo); // yeah!
----


And here is some silly math:
e^πi^ + 1 = 0 and H~2~O.
    `;
    
    const result = {
      type: "post",
      title: "TODO",
      plug: "TODO",
      text: Base64.encode(stubAsciiDoc),
      publishedAt: "TODO",
      tags: [
        "javascript",
        "testing"
      ],
      author: {
        name: "TODO",
        link: "/TODO"
      }
    }

    res.json(result);
  })

  .post((req, res) => {
    console.log('post post');
    res.send('post post');
  })

  .put((req, res) => {
    console.log('post put');
    res.send('put post');
  })

  .delete((req, res) => {
    console.log('post delete');
    res.send('delete post');
  });

  router.route('/post')

  .get((req, res) => {
    console.log("hei")
    // TODO change result based on req.query.page
    // TODO db access

    const dummyEntries = [
      {
        type: "post-preview",
        post: {
          id: 1,
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
          id: 2,
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
          id: 3,
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

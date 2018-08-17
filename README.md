# Loglevel: "blog" - Back-end API

## TODO

- Blog post searching
- /tag:id route to infos about blog posts that use the tag in order to allow safer deleting

## Deploy

### Create JWT certs:
openssl req -x509 -newkey rsa:4096 -keyout ll-blog-jwt-key.pem -out ll-blog-jwt-cert.pem -days 365 -nodes
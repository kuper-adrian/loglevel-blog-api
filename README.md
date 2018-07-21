# Loglevel: "blog" - Back-end API

## Deploy

### Create JWT certs:
openssl req -x509 -newkey rsa:4096 -keyout ll-blog-jwt-key.pem -out ll-blog-jwt-cert.pem -days 365 -nodes
mkdir secrets
cd secrets

mkdir jwt-certs
cd jwt-certs

openssl req -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout ll-blog-jwt-key.pem -out ll-blog-jwt-cert.pem
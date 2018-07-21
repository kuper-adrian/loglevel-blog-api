const fs = require('fs');

exports.init = () => {
  const publicJwtCert = fs.readFileSync('../secrets/jwt-certs/ll-blog-jwt-cert.pem');
  if (!publicJwtCert) {
    throw new Error('No public certificate for jwt');
  }

  const privateJwtKey = fs.readFileSync('../secrets/jwt-certs/ll-blog-jwt-key.pem');
  if (!privateJwtKey) {
    throw new Error('No private key for jwt');
  }

  const guidNamespace = fs.readFileSync('../secrets/guid-namespace');
  if (!guidNamespace) {
    throw new Error('No GUID namespace');
  }

  exports.publicJwtCert = publicJwtCert;
  exports.privateJwtKey = privateJwtKey;
  exports.guidNamespace = guidNamespace;
};

// Check if downloaded update validates against signature + public key of ...
// * sha binary digest (generated out of the downloaded zip file)
// * locally stored publickey of current running app (../dsa/dsa_pub.pem)
// * remotely provided DSA base64 signature (in remote package.json)

// Important: This verification mechanism must match the generation and sign procedures
// in '../dsa/generate_keys.sh' and '../dsa/sign_update.sh'. 
// If you make any modifications, be sure to change anything there as well.

'use strict';

// algorithm to use 
var VERIFY_ALGORITHM = 'dss1'
var HASH_ALGORITHM = 'sha1'

// requires
var crypto = require('crypto')
var fs = require('fs')

var pubkey = fs.readFileSync('../dsa/dsa_pub.pem').toString('utf-8')

// private functions
function createDigest(filePath) {
  var data = fs.readFileSync(filePath)
  var hash = crypto.createHash(HASH_ALGORITHM)
  hash.update(data, 'binary')
  return hash.digest()
}

function verifySignature(digest, DSASignature) {
  var verifier = crypto.createVerify(VERIFY_ALGORITHM)
  verifier.update(digest)
  return verifier.verify(pubkey, DSASignature, 'base64')
}

// public
module.exports = function verifyFileSignature(filePath, DSASignature) {
  return verifySignature(createDigest(filePath), DSASignature)
}
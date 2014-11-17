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
var path = require('path')

var pubkey = fs.readFileSync(path.join(__dirname, '../dsa/dsa_pub.pem')).toString('utf-8')

// private functions
// function createDigestSync(filePath) {
//   var data = fs.readFileSync(filePath)
//   var hash = crypto.createHash(HASH_ALGORITHM)
//   hash.update(data, 'binary')
//   return hash.digest()
// }

function createDigestAsync(filePath, callback) {
  var hash = crypto.createHash(HASH_ALGORITHM)
  var rs = fs.ReadStream(filePath)

  rs.on('data', function(d) {
    hash.update(d)
  })

  rs.on('end', function() {
    callback(null, hash.digest())
  })

  rs.on('error', function(e) {
    callback(e)
  })
}

function verifySignature(digest, dsaSignature) {
  var verifier = crypto.createVerify(VERIFY_ALGORITHM)
  verifier.update(digest)
  return verifier.verify(pubkey, dsaSignature, 'base64')
}


// function verifyFileSignature(filePath, dsaSignature) {
//   return verifySignature(createDigestSync(filePath), dsaSignature)
// }

function verifyFileSignatureAsync(filePath, dsaSignature, callback) {
  createDigestAsync(filePath, function(error, digest) {
    if (error) {
      throw error
      return
    }

    callback(verifySignature(digest, dsaSignature))
  })
}

// public
module.exports = {
  // verifyFileSignature: verifyFileSignature,
  verifyFileSignatureAsync: verifyFileSignatureAsync
}
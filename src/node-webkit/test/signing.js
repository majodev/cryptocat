// test signing with CURRENT dsa public key against CURRENT bundled signed files in release

var RELEASE_DIR = './../../release/'

var expect = require('chai').expect
var verifySignature = require('../lib/verifySignature')
var pkg = require('../package.json')
var basename = require('path').basename

describe('verifySignature', function() {

  // it('mac: dsa sig validates against dsa_pub and file sha1', function (done) {
  //   var val = verifySignature.verifyFileSignature(RELEASE_DIR + basename(pkg.packages.mac.url), pkg.packages.mac.dsa)
  //   expect(val).to.be.equal(true)
  //   done()
  // })

  // it('win: dsa sig validates against dsa_pub and file sha1', function (done) {
  //   var val = verifySignature.verifyFileSignature(RELEASE_DIR + basename(pkg.packages.win.url), pkg.packages.win.dsa)
  //   expect(val).to.be.equal(true)
  //   done()
  // })

  // it('linux32: dsa sig validates against dsa_pub and file sha1', function (done) {
  //   var val = verifySignature.verifyFileSignature(RELEASE_DIR + basename(pkg.packages.linux32.url), pkg.packages.linux32.dsa)
  //   expect(val).to.be.equal(true)
  //   done()
  // })

  // it('linux64: dsa sig validates against dsa_pub and file sha1', function (done) {
  //   var val = verifySignature.verifyFileSignature(RELEASE_DIR + basename(pkg.packages.linux64.url), pkg.packages.linux64.dsa)
  //   expect(val).to.be.equal(true)
  //   done()
  // })

  it('mac (async): dsa sig validates against dsa_pub and file sha1', function (done) {
    verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.mac.url), pkg.packages.mac.dsa, function (val) {
      expect(val).to.be.equal(true)
    })
    done()
  })

  it('win (async): dsa sig validates against dsa_pub and file sha1', function (done) {
    verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.win.url), pkg.packages.win.dsa, function (val) {
      expect(val).to.be.equal(true)
    })
    done()
  })

  it('linux32 (async): dsa sig validates against dsa_pub and file sha1', function (done) {
    verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.linux32.url), pkg.packages.linux32.dsa, function (val) {
      expect(val).to.be.equal(true)
    })
    done()
  })

  it('linux64 (async): dsa sig validates against dsa_pub and file sha1', function (done) {
    verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.linux64.url), pkg.packages.linux64.dsa, function (val) {
      expect(val).to.be.equal(true)
    })
    done()
  })

})
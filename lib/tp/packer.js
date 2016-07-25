'use strict'
const async = require('async')

const trim = require('./trim')
const pack = require('./bin')
const output = require('./output')
const meta = require('./meta')

module.exports = function texturepack(iDir, oDir, name, hasAlpha, callback) {
  async.waterfall([
    function (cb) {
      trim(iDir, hasAlpha, cb)
    },
    function (files, cb) {
      pack(files, cb)
    },
    function (files, width, height, cb) {
      output(files, {width, height, name, hasAlpha}, oDir, cb)
    },
    function (files, height, cb) {
      meta(files, height, oDir, name, cb)
    }
  ], callback)
}

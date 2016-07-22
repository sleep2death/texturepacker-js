'use strict'

const optimist = require('optimist')
const chalk = require('chalk')
const async = require('async')

const trim = require('./lib/trim')
const pack = require('./lib/pack')

const argv = optimist.usage('Usage: $0 <input> [options] <output> ').demand(2).argv

const log = chalk.grey
const error = chalk.red

// read input&output from arguments
const inputPath = argv._[0]
const outputPath = argv._[1]
const options = {}

console.log(log(`Packing images from ${inputPath} to ${outputPath}`))
texturepack(inputPath, outputPath, options, null)

function texturepack(input, outputPath, options, callback) {
  async.waterfall([
    function (cb) {
      trim(input, cb)
    },
    function (files, cb) {
      pack(files, cb)
    }
  ], callback)
}

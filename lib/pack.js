'use strict'

const MaxRectsBinPack = require('./MaxRectsBinPack')

module.exports = (files, callback) => {
  const packer = new MaxRectsBinPack(2048, 2048, false)
  const res = packer.insert2(files, 0)
  console.log(res)
  callback()
}

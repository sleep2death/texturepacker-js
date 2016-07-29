'use strict'

const fs = require('fs')

const async = require('async')
const ProgressBar = require('progress')

const pack = require('../tp/packer')

// generate spritesheets by vo
module.exports = function generate(name, input, output, cb) {
  // generate body's spritesheet
  const genList = []

  fs.readdir(`${input}/${name}`, (err, files) => {
    if(err) throw err
    files.forEach(file => {
      if(fs.statSync(`${input}/${name}/${file}`).isDirectory()) {
        genList.push({iDir: `${input}/${name}/${file}`, oDir: `${output}/${name}`, name: file})
      }
    })

    const bar = new ProgressBar('Packing sprites: [:bar] :current/:total :input -> :output', {
      total: genList.length
    })

    async.eachSeries(genList, (io, next) => {
      pack(io.iDir, {output: io.oDir, name: io.name}, next)
      bar.tick({input: io.iDir, output: io.oDir})
    }, cb)
  })
}

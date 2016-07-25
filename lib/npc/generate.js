'use strict'
const fs = require('fs')
const mkdirp = require('mkdirp')

const async = require('async')
const ProgressBar = require('progress')

const ACTION = ['idle', 'run', 'attack']

module.exports = (input, output, name, callback) => {
  fs.readdir(`${input}/${name}`, (err, files) => {
    if(err) throw err
    async.eachSeries(files, (file, next) => {
      readDir(input, output, `${name}/${file}`, next)
    }, callback)
  })
}

function readDir(root, output, path, callback) {
  fs.readdir(`${root}/${path}`, (err, files) => {
    if(err) throw err
    async.eachSeries(files, (file, next) => {
      if(ACTION.indexOf(file) >= 0) {
        createSprite(root, output, `${path}/${file}`, next)
      }else{
        next()
      }
    }, callback)
  })
}

function createSprite(root, output, path, next) {
  const p = /(npc)\/(.+)/.exec(path)[2]
  console.log(p)
  mkdirp(`${output}/${p}`, err => {
    if(err) throw err
    next()
  })
}

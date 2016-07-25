'use strict'

const fs = require('fs')
const async = require('async')

const configRole = require('./lib/role/config')
const generateRole = require('./lib/role/generate')

const generateNPC = require('./lib/npc/generate')

// const trim = require('./lib/trim')
// const pack = require('./lib/packer')
// const output = require('./lib/output')
// const meta = require('./lib/meta')

const PATH = 'svn/sprites'
const PATH_OUTPUT = 'svn/sprites_output'

console.log(`Packing images from ${PATH} to ${PATH_OUTPUT}`)
// texturepack(inputPath, outputPath)

fs.readdir(PATH, (err, files) => {
  if(err) throw err
  async.eachSeries(files, (file, next) => {
    if(fs.statSync(`${PATH}/${file}`).isDirectory() && file !== '.svn' && file !== 'npc' && file !== 'companion') {
      configRole(file, PATH, PATH_OUTPUT, (caller, vo) => {
        // generateRole(file, vo, next)
        next()
      })
    }else if(file === 'npc' || file === 'companion') {
      generateNPC(PATH, PATH_OUTPUT, file, next)
    }else{
      next()
    }
  })
})

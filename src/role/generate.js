'use strict'

const fs = require('fs')
const path = require('path')

const async = require('async')
const ProgressBar = require('progress')

const pack = require('../tp/texturepacker')

// generate spritesheets by vo
module.exports = function generate(config, cb) {
  const genList = []
  const alphaGenList = []

  const input = config.input
  const output = config.output
  const name = config.name

  const used = {}

  for(const wkey in config) {
    if(wkey === 'input' || wkey === 'output' || wkey === 'name') continue

    const actions = config[wkey]
    // console.log(actions)
    for(const akey in actions) {
      const action = actions[akey]

      const body = action.body
      const weapon = action.weapon
      const deco = action.deco

      // body
      checkImages(body)

      if(!used[body]) {
        const images = fs.readdirSync(`${input}/${name}/${body}`)
        used[body] = findImages(images)
      }

      // weapon
      checkImages(weapon)

      // deco
      checkImages(deco)

      config[wkey][akey].frames = used[body]
    }
  }

  function checkImages(folder) {
    if(fs.statSync(`${input}/${name}/${folder}`).isDirectory()) {
      if(!used[folder]) {
        genList.push({iDir: `${input}/${name}/${folder}`, oDir: `${output}/${name}`, name: folder})

        const alpha = (/(.+)(_a)$/).exec(folder)
        if(alpha) {
          // if it has alpha channel images already, pack it
          genList.push({iDir: `${input}/${name}/${alpha[1]}`, oDir: `${output}/${name}`, name: alpha[1]})
        }else{
          // if not, make the alpha channel images first
          alphaGenList.push({iDir: `${input}/${name}/${folder}`, oDir: `${input}/${name}/${folder}_a`, name: `${folder}_a`})
          genList.push({iDir: `${input}/${name}/${folder}_a`, oDir: `${output}/${name}`, name: `${folder}_a`})
        }
      }
    }else{
      throw new Error(`Folder not exist:${folder}`)
    }
  }

  function findImages(images) {
    const files = []
    images.forEach(image => {
      if(path.extname(image).toLowerCase() === '.png') files.push(image)
    })

    return files
  }

  // now pack the images
  const bar = new ProgressBar('Packing sprites: [:bar] :current/:total :input -> :output', {
    total: genList.length
  })

  const abar = new ProgressBar('Generateing Alpha Images: [:bar] :current/:total :input -> :output', {
    total: alphaGenList.length
  })

  async.eachSeries(alphaGenList, (io, next) => {
    pack(io.iDir, {output: io.oDir, name: io.name, genAlpha: true}, next)
    abar.tick({input: io.iDir, output: io.oDir})
  }, () => {
    async.eachSeries(genList, (io, next) => {
      pack(io.iDir, {output: io.oDir, name: io.name, genAlpha: false}, next)
      bar.tick({input: io.iDir, output: io.oDir})
    }, () => {
      fs.writeFile(`${output}/${name}/config.json`, JSON.stringify(config, null, 2), err => {
        if(err) throw err
        cb()
      })
    })
  })

  /* async.eachSeries(genList, (io, next) => {
    pack(io.iDir, {output: io.oDir, name: io.name, genAlpha: false}, next)
    bar.tick({input: io.iDir, output: io.oDir})
  }, () => {
    fs.writeFile(`${output}/${name}/config.json`, JSON.stringify(config, null, 2), err => {
      if(err) throw err
      cb()
    })
  })*/
}


'use strict'

const fs = require('fs')

const yaml = require('js-yaml')

module.exports = (files, height, output, name, callback) => {
  const sprites = []
  files.forEach(file => {
    const sprite = {}
    sprite.serializedVersion = 2
    sprite.name = file.name
    sprite.rect = {
      serializedVersion: 2,
      x: file.x,
      y: height - (file.y + file.h),
      width: file.w,
      height: file.h
    }
    sprite.alignment = 9
    sprite.pivot = {x: file.pX, y: file.pY}
    sprites.push(sprite)
  })

  fs.stat(`${output}/${name}.png.meta`, err => {
    let doc = null
    if(err) {
      // meta file not exist
      doc = {
        TextureImporter: {
          spriteMode: 2,
          textureType: 8,
          spriteSheet: {
            serializedVersion: 2,
            sprites: []
          }
        }
      }
    }else{
      try{
        doc = yaml.safeLoad(fs.readFileSync(`${output}/${name}.png.meta`, 'utf-8'))
      } catch(err) {
        throw err
      }
    }

    doc.TextureImporter.spriteSheet.sprites = sprites
    fs.writeFile(`${output}/${name}.png.meta`, yaml.safeDump(doc), err => {
      if (err) {
        return console.log(err)
      }
      callback()
    })
  })
}

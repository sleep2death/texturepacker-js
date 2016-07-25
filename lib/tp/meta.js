'use strict'

const fs = require('fs')

const yaml = require('js-yaml')

module.exports = (files, height, output, name, callback) => {
  const meta = {
    TextureImporter: {
      spriteMode: 2,
      textureType: 8,
      spriteSheet: {
        serializedVersion: 2,
        sprites: []
      }
    }
  }

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
    meta.TextureImporter.spriteSheet.sprites.push(sprite)
  })

  const res = yaml.dump(meta)

  fs.writeFile(`${output}/${name}.png.meta`, res, err => {
    if (err) {
      return console.log(err)
    }
    callback()
  })
}

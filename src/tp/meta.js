'use strict'

const fs = require('fs')

module.exports = (files, options, callback) => {
  const frames = []

  files.forEach(file => {
    const frame = {}
    frame.framename = file.name
    frame.rotated = false
    frame.trimmed = true
    frame.frame = {x: file.x, y: file.y, w: file.width, h: file.height}
    frame.spriteSourceSize = {x: file.trimX, y: file.trimY, w: file.width, h: file.height}
    frame.sourceSize = {w: file.trimW, h: file.trimH}
    frames.push(frame)
  })

  const meta = {
    image: `${options.name}.png`,
    format: 'RGB888',
    size: {w: options.width, h: options.height},
    scale: 1
  }

  const json = {frames, meta}
  fs.writeFile(`${options.output}/${options.name}.json`, JSON.stringify(json, null, 2), err => {
    if(err) throw err
    callback()
  })
}

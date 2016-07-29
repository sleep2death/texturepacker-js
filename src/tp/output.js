'use strict'
const fs = require('fs')
const path = require('path')

const exec = require('platform-command').exec

module.exports = (input, options, files, callback) => {
  const canvasW = roundToPowerOfTwo(options.width)
  const canvasH = roundToPowerOfTwo(options.height)
  // input images
  const command = [`convert -define png:exclude-chunks=date -size ${canvasW}x${canvasH} xc:none`]

  // combine all images by packer's info
  files.forEach(file => {
    command.push(`"${file.path}" -geometry +${file.fit.x}+${file.fit.y} -composite`)
  })

  command.push(`${options.output}/${options.name}.png`)

  const reg = /(.+)(_a)$/
  // if the alpha channel's folder not existed, then create an alpha map automatically
  if(reg.exec(options.name) === null) {
    try{
      fs.statSync(`${input}_a`)
    }catch(err) {
      // extract alpha channel from origin
      command.push(`&& convert ${options.output}/${options.name}.png -alpha extract ${options.output}/${options.name}_a.png`)
      // replace it to green
      command.push(`&& convert ${options.output}/${options.name}_a.png -background lime -alpha shape ${options.output}/${options.name}_a.png`)
      // delete alpha channel
      command.push(`&& convert ${options.output}/${options.name}_a.png -background black -alpha remove ${options.output}/${options.name}_a.png`)
    }
  }
    // remove alpha channel from origin
  command.push(`&& convert ${options.output}/${options.name}.png -background black -alpha remove ${options.output}/${options.name}.png`)

  files.forEach(file => {
    file.x = file.fit.x
    file.y = file.fit.y

    // create pivot points
    file.pX = ((file.trim.w * 0.5) - file.trim.x) / file.w
    file.pY = (file.h - ((file.trim.h * 0.604) - file.trim.y)) / file.h

    file.name = path.basename(file.path)

    delete file.fit
    delete file.trim
  })

  exec(command.join(' '), err => {
    if(err) throw err
    callback(null, files, canvasH)
  })
}

function roundToPowerOfTwo(value) {
  let powers = 2
  while (value > powers) {
    powers *= 2
  }

  return powers
}

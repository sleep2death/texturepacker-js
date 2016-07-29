'use strict'
const fs = require('fs')

const exec = require('platform-command').exec

module.exports = (input, options, files, callback) => {
  const canvasW = roundToPowerOfTwo(options.width)
  const canvasH = roundToPowerOfTwo(options.height)
  // input images
  const command = [`convert -define png:exclude-chunks=date -size ${canvasW}x${canvasH} xc:none`]

  // combine all images by packer's info
  files.forEach(file => {
    const offsetX = (file.fit.x - file.crop.x) >= 0 ? `+${file.fit.x - file.crop.x}` : `-${Math.abs(file.fit.x - file.crop.x)}`
    const offsetY = file.fit.y - file.crop.y >= 0 ? `+${file.fit.y - file.crop.y}` : `-${Math.abs(file.fit.y - file.crop.y)}`

    command.push(`"${file.iPath}" -geometry ${offsetX}${offsetY} -composite`)
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
    file.pX = ((file.crop.w * 0.5) - file.crop.x) / file.w
    file.pY = (file.h - ((file.crop.h * 0.604) - file.crop.y)) / file.h

    delete file.fit
    delete file.crop
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

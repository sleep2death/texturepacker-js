'use strict'

const exec = require('platform-command').exec

module.exports = (files, options, output, callback) => {
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

  command.push(`${output}/${options.name}.png`)

  // input channel images
  if(options.hasAlpha) {
    command.push(`&& convert -define png:exclude-chunks=date -size ${canvasW}x${canvasH} xc:black -alpha off`)

    files.forEach(file => {
      const offsetX = (file.fit.x - file.crop.x) >= 0 ? `+${file.fit.x - file.crop.x}` : `-${Math.abs(file.fit.x - file.crop.x)}`
      const offsetY = file.fit.y - file.crop.y >= 0 ? `+${file.fit.y - file.crop.y}` : `-${Math.abs(file.fit.y - file.crop.y)}`

      command.push(`"${file.iPathA}" -geometry ${offsetX}${offsetY} -composite`)

      file.x = file.fit.x
      file.y = file.fit.y

      // create anchor point
      file.pX = ((file.crop.w * 0.5) - file.crop.x) / file.w
      file.pY = (file.h - ((file.crop.h * 0.604) - file.crop.y)) / file.h

      delete file.fit
      delete file.crop
    })

    command.push(`${output}/a/${options.name}_a.png`)

    // remove alpha channel from origin
    command.push(`&& convert ${output}/${options.name}.png -background black -alpha remove ${output}/${options.name}.png`)
  }else {
    // extract alpha channel from origin
    command.push(`&& convert ${output}/${options.name}.png -alpha extract ${output}/a/${options.name}_a.png`)
    // replace it to green
    command.push(`&& convert ${output}/a/${options.name}_a.png -background green -alpha shape ${output}/a/${options.name}_a.png`)
  }

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

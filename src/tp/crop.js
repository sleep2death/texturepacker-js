const fs = require('fs')
const ProgressBar = require('progress')

const exec = require('platform-command').exec

const async = require('async')
const plist = require('plist')


module.exports = (genList, callback) => {
  const abar = new ProgressBar('Generateing images from plist: [:bar] :current/:total :input', {
    total: genList.length
  })

  async.eachSeries(genList, (io, next) => {
    combineImages(io, next)
    abar.tick({input: `${io.oDir}/${io.name}.plist`})
  }, callback)
}

function combineImages(io, next) {
  const name = (/(.+)(_a)$/).exec(io.name)[1]
  const listPath = `${io.oDir}/${name}.plist`
  const data = plist.parse(fs.readFileSync(listPath, 'utf8'))

  // get the image size
  const size = /\{(\d+),(\d+)\}/.exec(data.metadata.size)
  const width = size[1]
  const height = size[2]

  // rename alpha channel image
  const oDir = `${io.oDir}/${(/(.+)(_a)$/).exec(io.name)[1]}`
  const command = [`mv ${oDir}.pvr.ccz ${oDir}_a.pvr.ccz`]

  command.push(`&&convert -define png:exclude-chunks=date -size ${width}x${height} xc:none`)

  for(const frameName in data.frames) {
    const frame = data.frames[frameName]
    const textureRect = /\{(\d+),(\d+)\},\{(\d+),(\d+)\}/.exec(frame.textureRect)
    const oSize = /\{(\d+),(\d+)\}/.exec(frame.spriteSourceSize)

    const spriteOffset = /\{(\-*\d+),(\-*\d+)\}/.exec(frame.spriteOffset)

    // get the trim rect by plist's frame info
    const trimRect = getTrimOffset(Number(spriteOffset[1]), Number(spriteOffset[2]), Number(textureRect[3]), Number(textureRect[4]), Number(oSize[1]), Number(oSize[2]))

    const dir = (/(.+)(_a)$/).exec(io.iDir)[1]
    const fName = frameName.split('-')[0]

    let ox = Number(textureRect[1]) - trimRect.x
    let oy = Number(textureRect[2]) - trimRect.y
    ox = ox >= 0 ? `+${ox}` : `${ox}`
    oy = oy >= 0 ? `+${oy}` : `${oy}`

    command.push(`${dir}/${fName}.png -geometry ${ox}${oy} -composite`)
  }

  command.push(`${oDir}.png`)

  // transform the png to pvr.ccz
  command.push(`&& TexturePacker ${oDir}.png --texture-format pvr3ccz --trim-mode None --opt PVRTC4_NOALPHA --format spritesheet-only --disable-rotation --sheet ${oDir}.pvr.ccz`)

  // remove the png
  command.push(`&& rm ${oDir}.png`)

  exec(command.join(' '), err => {
    if(err) throw err
    next()
  })
}

function getTrimOffset(x, y, w, h, ow, oh) {
  const trimX = x + (ow * 0.5) - (w * 0.5)
  const trimY = y + (oh * 0.5) - (h * 0.5)
  return {x: trimX, y: (oh - trimY - h), w, h}
}

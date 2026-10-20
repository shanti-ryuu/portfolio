import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import sharp from 'sharp'

const run = promisify(execFile)
const root = process.cwd()
const sourceDir = path.join(root, 'public/media/cat-dancing')
const outputDir = path.join(sourceDir, 'optimized')
const clips = ['damdamdidi', 'scuba', 'thankyou']
await mkdir(outputDir, { recursive: true })

async function probe(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,codec_type,pix_fmt,width,height,duration:format=duration', '-of', 'json', file])
  return JSON.parse(stdout)
}

function sampleCornerBackground(data, info) {
  const points = []
  const patch = 8
  for (const [x0, y0] of [[0, 0], [info.width - patch, 0], [0, info.height - patch], [info.width - patch, info.height - patch]]) {
    for (let y = y0; y < y0 + patch; y += 1) for (let x = x0; x < x0 + patch; x += 1) {
      const offset = (y * info.width + x) * info.channels
      points.push([data[offset], data[offset + 1], data[offset + 2]])
    }
  }
  const mean = [0, 1, 2].map((channel) => Math.round(points.reduce((sum, pixel) => sum + pixel[channel], 0) / points.length))
  const spread = Math.max(...points.flatMap((pixel) => pixel.map((channel, index) => Math.abs(channel - mean[index]))))
  return { rgb: mean, maxChannelDeviation: spread, solid: spread <= 15 }
}

for (const name of clips) {
  const source = path.join(sourceDir, `${name}.mp4`)
  const sourceStat = await stat(source)
  if (!sourceStat.isFile()) throw new Error(`Missing cat source: ${source}`)
  const metadata = await probe(source)
  const stream = metadata.streams.find((item) => item.codec_type === 'video')
  if (!stream) throw new Error(`No video stream: ${source}`)
  const poster = path.join(outputDir, `${name}-poster.png`)
  const output = path.join(outputDir, `${name}.mp4`)
  await run('ffmpeg', ['-y', '-v', 'error', '-i', source, '-frames:v', '1', '-vf', 'scale=360:-2:flags=neighbor', '-update', '1', poster])
  const { data, info } = await sharp(poster).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const background = sampleCornerBackground(data, info)
  if (!background.solid) throw new Error(`${name} background is not solid enough for a clean hard key (corner deviation ${background.maxChannelDeviation}). Do not publish this clip until it is re-exported with alpha.`)

  let outputBytes = 0
  for (const crf of [30, 34, 38, 42]) {
    await run('ffmpeg', ['-y', '-v', 'error', '-i', source, '-vf', 'scale=360:-2:flags=neighbor:out_range=tv,fps=15,format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-movflags', '+faststart', output])
    outputBytes = (await stat(output)).size
    if (outputBytes <= 1024 * 1024) break
  }
  if (outputBytes > 1024 * 1024) throw new Error(`${name} optimized video is still larger than 1 MB (${outputBytes} bytes).`)
  const optimized = await probe(output)
  const optimizedVideo = optimized.streams.find((item) => item.codec_type === 'video')
  if (!optimizedVideo || optimizedVideo.width > 360 || optimizedVideo.pix_fmt !== 'yuv420p' || optimized.streams.some((item) => item.codec_type === 'audio')) {
    throw new Error(`Optimized ${name} failed codec/size/audio checks.`)
  }
  console.log(`${name}: ${stream.codec_name} ${stream.pix_fmt} ${stream.width}x${stream.height}, ${Number(metadata.format.duration).toFixed(2)}s, audio=${metadata.streams.some((item) => item.codec_type === 'audio')}; background RGB ${background.rgb.join(',')} (deviation ${background.maxChannelDeviation}); output ${optimizedVideo.width}x${optimizedVideo.height}, ${outputBytes} bytes.`)
}

const extras = (await readdir(sourceDir)).filter((name) => name.toLowerCase().endsWith('.mp4') && !clips.includes(path.basename(name, '.mp4')))
if (extras.length) throw new Error(`Unclassified cat videos: ${extras.join(', ')}`)
console.log('Built three silent H.264 pixel-scaled clips and first-frame posters. thankyou is optimized but intentionally not mounted.')

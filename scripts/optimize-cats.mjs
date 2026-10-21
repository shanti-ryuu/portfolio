import { mkdtemp, mkdir, readdir, rename, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import sharp from 'sharp'

const run = promisify(execFile)
const root = process.cwd()
const dir = path.join(root, 'public/media/cat-dancing')
const swiftKeyer = path.join(root, 'scripts/key-cat-frames.swift')
const posterOnly = process.argv.includes('--posters-only')
const onlyName = process.argv.find((argument) => argument.startsWith('--only='))?.split('=')[1]
const fps = 24
const clips = [
  { name: 'damdamdidi', despill: 'green' },
  { name: 'scuba', despill: 'blue' },
  { name: 'thankyou', despill: 'green', preserveText: true },
]
await mkdir(dir, { recursive: true })

async function probe(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt,duration', '-of', 'json', file])
  return JSON.parse(stdout).streams[0]
}

function sampleCorners(data, info) {
  const patch = Math.max(2, Math.round(Math.min(info.width, info.height) * .01))
  const points = []
  for (const [x0, y0] of [[0, 0], [info.width - patch, 0], [0, info.height - patch], [info.width - patch, info.height - patch]]) {
    for (let y = y0; y < y0 + patch; y++) for (let x = x0; x < x0 + patch; x++) {
      const at = (y * info.width + x) * info.channels
      points.push([data[at], data[at + 1], data[at + 2]])
    }
  }
  return [0, 1, 2].map((channel) => Math.round(points.reduce((sum, pixel) => sum + pixel[channel], 0) / points.length))
}

for (const { name, despill, preserveText } of clips.filter((clip) => !onlyName || clip.name === onlyName)) {
  const source = path.join(dir, `${name}.mp4`)
  const sourceSize = (await stat(source)).size
  const sourceInfo = await probe(source)
  const temp = await mkdtemp(path.join(os.tmpdir(), `portfolio-cat-${name}-`))
  const frameDir = path.join(temp, 'frames')
  const maskDir = path.join(temp, 'masks')
  await Promise.all([mkdir(frameDir), mkdir(maskDir)])
  try {
    const framePattern = path.join(frameDir, 'frame-%06d.jpg')
    await run('ffmpeg', ['-y', '-v', 'error', '-i', source, '-vf', `fps=${fps}`, '-q:v', '2', ...(posterOnly ? ['-frames:v', '1'] : []), framePattern])
    const firstFrame = path.join(frameDir, 'frame-000001.jpg')
    const frameRaw = await sharp(firstFrame).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const corners = sampleCorners(frameRaw.data, frameRaw.info)
    console.log(`${name}: ${sourceInfo.width}x${sourceInfo.height}, ${sourceInfo.r_frame_rate} fps, ${sourceInfo.pix_fmt}, ${sourceSize} bytes; frame-1 corners RGB ${corners.join(',')}.`)
    await run('swift', [swiftKeyer, frameDir, maskDir, String(sourceInfo.width), ...(preserveText ? ['text'] : [])], { maxBuffer: 4 * 1024 * 1024 })

    for (const frameName of (await readdir(frameDir)).sort()) {
      const frame = path.join(frameDir, frameName)
      const matte = path.join(maskDir, frameName.replace(/\.jpg$/, '.png'))
      const [image, alpha] = await Promise.all([
        sharp(frame).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
        sharp(matte).greyscale().raw().toBuffer(),
      ])
      const { width, height } = image.info
      const edgeDistance = new Uint8Array(alpha.length)
      for (let pixel = 0; pixel < alpha.length; pixel++) edgeDistance[pixel] = alpha[pixel] > 5 ? 255 : 0
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const pixel = y * width + x
        if (!edgeDistance[pixel]) continue
        let distance = edgeDistance[pixel]
        if (x > 0) distance = Math.min(distance, edgeDistance[pixel - 1] + 1)
        if (y > 0) {
          distance = Math.min(distance, edgeDistance[pixel - width] + 1)
          if (x > 0) distance = Math.min(distance, edgeDistance[pixel - width - 1] + 1)
          if (x + 1 < width) distance = Math.min(distance, edgeDistance[pixel - width + 1] + 1)
        }
        edgeDistance[pixel] = distance
      }
      for (let y = height - 1; y >= 0; y--) for (let x = width - 1; x >= 0; x--) {
        const pixel = y * width + x
        if (!edgeDistance[pixel]) continue
        let distance = edgeDistance[pixel]
        if (x + 1 < width) distance = Math.min(distance, edgeDistance[pixel + 1] + 1)
        if (y + 1 < height) {
          distance = Math.min(distance, edgeDistance[pixel + width] + 1)
          if (x + 1 < width) distance = Math.min(distance, edgeDistance[pixel + width + 1] + 1)
          if (x > 0) distance = Math.min(distance, edgeDistance[pixel + width - 1] + 1)
        }
        edgeDistance[pixel] = distance
      }
      for (let pixel = 0, color = 0; pixel < alpha.length; pixel++, color += 3) {
        if (alpha[pixel] < 8 || edgeDistance[pixel] > 7) continue
        const r = image.data[color]
        const g = image.data[color + 1]
        const b = image.data[color + 2]
        if (despill === 'green' && g > Math.max(r, b) + 10) image.data[color + 1] = Math.max(r, b) + Math.round((g - Math.max(r, b)) * .05)
        else if (despill === 'blue' && b > Math.max(r, g) + 10) image.data[color + 2] = Math.max(r, g) + Math.round((b - Math.max(r, g)) * .05)
      }
      await sharp(image.data, { raw: image.info }).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toFile(`${frame}.clean.jpg`)
      await rm(frame)
      const cleanFrame = `${frame}.clean.jpg`
      const renamedFrame = frame
      await rename(cleanFrame, renamedFrame)
    }

    const maskPattern = path.join(maskDir, 'frame-%06d.png')
    const mask = path.join(maskDir, 'frame-000001.png')
    const poster = path.join(dir, `${name}-poster.png`)
    const posterMask = await sharp(mask).toColourspace('srgb').png().toBuffer()
    await sharp(firstFrame).joinChannel(posterMask).png().toFile(poster)
    if (posterOnly) {
      const posterInfo = await sharp(poster).metadata()
      console.log(`${name}: transparent poster ${posterInfo.width}x${posterInfo.height}.`)
      continue
    }

    const composite = `[0:v]format=rgba[fg];[1:v]format=gray[matte];[fg][matte]alphamerge,format=yuva420p[out]`
    const webm = path.join(dir, `${name}.webm`)
    await run('ffmpeg', ['-y', '-v', 'error', '-framerate', String(fps), '-i', framePattern, '-framerate', String(fps), '-i', maskPattern, '-filter_complex', composite, '-map', '[out]', '-an', '-shortest', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-auto-alt-ref', '0', webm])

    const mov = path.join(dir, `${name}.mov`)
    const hevcComposite = `[0:v]format=rgba[fg];[1:v]format=gray[matte];[fg][matte]alphamerge,format=bgra[out]`
    try {
      await run('ffmpeg', ['-y', '-v', 'error', '-framerate', String(fps), '-i', framePattern, '-framerate', String(fps), '-i', maskPattern, '-filter_complex', hevcComposite, '-map', '[out]', '-an', '-shortest', '-c:v', 'hevc_videotoolbox', '-allow_sw', '1', '-alpha_quality', '0.75', '-tag:v', 'hvc1', mov])
    } catch (error) {
      console.warn(`${name}: VideoToolbox HEVC alpha encode failed (${error.message.split('\n')[0]}). Converting a ProRes 4444 alpha intermediate with avconvert.`)
      const intermediate = path.join(temp, `${name}-alpha-prores.mov`)
      const proresComposite = `[0:v]format=rgba[fg];[1:v]format=gray[matte];[fg][matte]alphamerge,format=yuva444p10le[out]`
      await run('ffmpeg', ['-y', '-v', 'error', '-framerate', String(fps), '-i', framePattern, '-framerate', String(fps), '-i', maskPattern, '-filter_complex', proresComposite, '-map', '[out]', '-an', '-shortest', '-c:v', 'prores_ks', '-profile:v', '4', intermediate])
      await run('avconvert', ['--source', intermediate, '--preset', 'PresetHEVCHighestQualityWithAlpha', '--output', mov, '--replace'])
    }
    const posterInfo = await sharp(poster).metadata()
    console.log(`${name}: Vision foreground mask + ${preserveText ? 'preserved text' : `${despill} clip`} -> poster ${posterInfo.width}x${posterInfo.height}; WebM ${(await stat(webm)).size} bytes; MOV ${(await stat(mov)).size} bytes.`)
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
}

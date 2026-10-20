import { rm, stat } from 'node:fs/promises'
import path from 'node:path'

const distRoot = path.join(process.cwd(), 'dist')
for (const directory of ['certificates', 'screenshots-of-projects']) {
  const target = path.join(distRoot, directory)
  try {
    const details = await stat(target)
    if (details.isDirectory()) await rm(target, { recursive: true, force: true })
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}
for (const sourceClip of ['damdamdidi.mp4', 'scuba.mp4', 'thankyou.mp4']) {
  await rm(path.join(distRoot, 'media', 'cat-dancing', sourceClip), { force: true })
}
console.log('Removed source-only certificate and project screenshot folders from dist; optimized gallery assets remain available.')

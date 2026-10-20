import { access, mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const sourceRoot = path.join(root, 'public/screenshots-of-projects')
const outputRoot = path.join(root, 'public/media/projects')
const generatedPath = path.join(root, 'src/data/gallery.generated.ts')

const sourceGroups = {
  dominotes: [
    { file: 'dominotes/project2.webp', name: 'appearance-and-folder-settings', alt: 'DomiNotes settings with dark mode, system theme, PIN security, biometric options, and a new folder dialog.', caption: 'Settings show theme and PIN options alongside a new folder dialog.' },
    { file: 'dominotes/project.jpeg', name: 'design-wireframes', alt: 'DomiNotes design wireframes labeled PIN Login Screen (Input), Notes Dashboard (Process), Create Note Screen (Input), and Export Note Modal (Output).', caption: 'Design wireframes map PIN login, notes, note creation, and export across input, process, and output states.' },
  ],
  'grain-solar-rice-dryer': [
    { file: 'iot-solar-rice-grain/IMG_8493.PNG', name: 'mobile-monitor-dashboard', alt: 'Rice dryer mobile dashboard with moisture and energy readings, fan and system status, and command history.', caption: 'Dashboard UI state shows moisture and energy fields, fan and system status, and recent command history.' },
    { file: 'iot-solar-rice-grain/IMG_9366.PNG', name: 'device-monitor-dashboard', alt: 'Mobile dryer monitor with offline server status, dryer cards, and an active drying session panel.', caption: 'Monitor UI state shows dryer cards and an active-session panel; displayed values are not verified measurements.' },
    { file: 'iot-solar-rice-grain/IMG_9367.PNG', name: 'dryer-control', alt: 'Dryer control screen with device selection, auto and manual modes, temperature and fan sliders, and a start button.', caption: 'Control UI state shows device selection, operating mode, temperature, and fan speed controls.' },
    { file: 'iot-solar-rice-grain/IMG_9368.PNG', name: 'drying-sessions', alt: 'Drying sessions screen with a current session progress bar and a history of previous sessions.', caption: 'Sessions UI state shows a progress bar and session history without asserting a drying outcome.' },
    { file: 'iot-solar-rice-grain/IMG_9369.PNG', name: 'analytics-overview', alt: 'Analytics page with daily, weekly, and monthly filters, session and energy totals, and a moisture trend chart.', caption: 'Analytics UI state shows summary cards and a moisture trend chart; values are not verified results.' },
    { file: 'iot-solar-rice-grain/IMG_9370.PNG', name: 'system-alerts', alt: 'Alerts page listing critical, warning, and informational dryer notices.', caption: 'The alerts interface lists critical, warning, and informational notices.' },
    { file: 'iot-solar-rice-grain/IMG_9380.PNG', name: 'drying-chamber-detail', alt: 'Device detail screen with a 3D drying chamber view and temperature, humidity, moisture, and fan readings.', caption: 'Device UI state pairs a chamber illustration with temperature, humidity, moisture, and fan fields.' },
    { file: 'iot-solar-rice-grain/IMG_9387.PNG', name: 'moisture-and-energy-charts', alt: 'Analytics charts for moisture trend, session status, and energy usage.', caption: 'Chart UI state displays moisture, session status, and energy fields.' },
    { file: 'iot-solar-rice-grain/IMG_9388.PNG', name: 'alerts-and-notifications', alt: 'Alerts page with moisture warnings and notifications for drying activity.', caption: 'The alerts interface shows moisture warnings and recent drying notifications.' },
    { file: 'iot-solar-rice-grain/78a53f11474dd0ab3057adad4a6f1495.JPEG', name: 'team-prototype-review', alt: 'Project group gathered around a green rice dryer prototype with a solar panel and project poster.', caption: 'Team collaboration photo beside a green dryer prototype and project poster.' },
    { file: 'iot-solar-rice-grain/att.IraIBg_LXLjK8UzCEGZ2G6tK-6_9oUPDzQhhZ-tL5BI.JPG', name: 'project-overview-poster', alt: 'Project overview poster with a solar dryer illustration, phone mockup, and monitoring diagram.', caption: 'Overview poster pairs a dryer illustration with a phone mockup and system diagram.' },
    { file: 'iot-solar-rice-grain/att.MlK4Pq9XdvnyzAetN3UdVOrcdcZoP5qQlWr8DZF9Vd0.JPG', name: 'system-poster-display', alt: 'Project poster showing a dryer illustration, mobile interface screenshots, and a technology list.', caption: 'Poster display shows a dryer illustration, interface screenshots, and a technology list.' },
  ],
  scentryx: [
    { file: 'scentryx/Screenshot 2026-10-20 at 22.13.43.png', name: 'gas-monitor-dashboard', alt: 'ScentryX dashboard showing a Kitchen Sensor, gas-level display, Safe status, and Online device state.', caption: 'The dashboard UI shows the Kitchen Sensor, gas-level display, Safe status, and Online device state.' },
    { file: 'scentryx/Screenshot 2026-10-20 at 22.12.52.png', name: 'sign-in', alt: 'ScentryX sign-in form with blank email and password fields.', caption: 'The sign-in screen has empty email and password fields.' },
    { file: 'scentryx/Screenshot 2026-10-20 at 22.13.18.png', name: 'create-account', alt: 'ScentryX account form with full name, email, password, and password confirmation fields.', caption: 'Create Account form with name, email, password, and confirmation fields.' },
  ],
}

const teamPhotos = [
  { file: 'team-collab-participation/IMG_3235.jpg', name: 'prototype-review', alt: 'Group meeting around a table with laptops and a green project prototype.', caption: 'Team collaboration photo during a project discussion beside the prototype.' },
  { file: 'team-collab-participation/IMG_3237.jpg', name: 'project-booth', alt: 'Two participants beside a project display at an event.', caption: 'Team collaboration photo at a project display.' },
  { file: 'team-collab-participation/IMG_3238.jpg', name: 'team-celebration', alt: 'Group portrait at an event with participants holding certificates.', caption: 'Team collaboration photo after an event presentation.' },
  { file: 'team-collab-participation/IMG_8543.jpg', name: 'classroom-work-session', alt: 'Group selfie in a classroom with laptops on desks.', caption: 'Team collaboration photo during a classroom work session.' },
  { file: 'team-collab-participation/IMG_8551.jpg', name: 'dryer-project-display', alt: 'Three participants beside a green dryer prototype and project posters.', caption: 'Team collaboration photo beside the dryer project display.' },
  { file: 'team-collab-participation/scentryx.JPEG', name: 'scentryx-project-event', alt: 'Group portrait at a project event with a gas detection system poster on a screen.', caption: 'Team collaboration photo at a project event.' },
]

const certificateImages = [
  ['cisco-packet-tracer-course', 'course completion/cisco-packet-tracer-course.png', 'Getting Started with Cisco Packet Tracer', 'St. Dominic College of Asia · Cisco Networking Academy', '6 February 2026'],
  ['cybersecurity', 'course completion/cybersecurity.png', 'Information Technology Specialist Certification: Cybersecurity', 'Pearson · Certiport', '4 February 2026'],
  ['introduction-to-cybersec', 'course completion/introduction-to-cybersec.png', 'Introduction to Cybersecurity', 'St. Dominic College of Asia · Cisco Networking Academy', '20 October 2026'],
  ['introduction-to-iot', 'course completion/introduction-to-iot.png', 'Introduction to IoT and Digital Transformation', 'St. Dominic College of Asia · Cisco Networking Academy', '3 March 2026'],
  ['java-course', 'course completion/java-course.png', 'Java Foundations', 'Oracle Academy', '27 December 2024'],
  ['microsoft-specialist', 'course completion/microsoft-specialist.png', 'Microsoft Office Specialist: PowerPoint 2019 Associate', 'Microsoft · Certiport', '30 May 2024'],
  ['software-dev', 'course completion/software-dev.png', 'Software Development', 'Pearson · Certiport', '3 June 2026'],
  ['deanslist-cert1', 'education cert/deanslist-cert1.png', 'Dean’s List · First Semester, Academic Year 2025–2026', 'St. Dominic College of Asia', '27 April 2026'],
  ['deanslist-certs', 'education cert/deanslist-certs.png', 'Dean’s List · First Semester, Academic Year 2025–2026', 'St. Dominic College of Asia', '27 April 2026'],
  ['pictorial-deanslist', 'education cert/pictorial-deanslist.png', 'Dean’s List recognition event photo', 'St. Dominic College of Asia', '27 April 2026'],
  ['course-passers-photo-record', 'education cert/pictrial-course-passers.JPG', 'Photo record: Networking, JavaScript, and Cybersecurity passers', '', ''],
  ['dict-participation', 'extracurricular cert/DICT-participation.png', 'Digital Startup Development and Acceleration Program (DSDAP) Caravan', 'ICT Industry Development Bureau · DICT Region IV-A', '29 May 2024'],
  ['code-hunt-2ndplace', 'extracurricular cert/code-hunt-2ndplace.png', '2nd Place · Domini Xode Code Hunt', 'Domini Xode', ''],
  ['egovph-participation', 'extracurricular cert/egovph-participation.png', 'eGOVPH Super App Orientation', 'Department of Information and Communications Technology · Region IV-A', '29 May 2024'],
  ['prompt-engineering', 'extracurricular cert/prompt-engineering.png', 'Prompt Engineering & AI Practice', 'Dominican Forge · ICT Department', '2025'],
].map(([id, file, title, issuer, date]) => ({
  id, file,
  alt: `${title}${issuer ? ` · ${issuer}` : ''}${date ? ` · ${date}` : ''}.`,
  caption: `${title}${issuer ? ` · ${issuer}` : ''}${date ? ` · ${date}` : ''}.`,
}))

const allSources = [
  ...Object.values(sourceGroups).flatMap((group) => group.map((item) => item.file)),
  ...teamPhotos.map((item) => item.file),
]

async function findImages(folder, relativeTo = folder) {
  const found = []
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name)
    if (entry.isDirectory()) found.push(...(await findImages(full, relativeTo)))
    else if (entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name)) found.push(path.relative(relativeTo, full))
  }
  return found
}

async function verifyInventory(folder, expected, label) {
  const found = await findImages(folder, folder)
  const missing = expected.filter((file) => !found.includes(file))
  const unclassified = found.filter((file) => !expected.includes(file))
  if (missing.length || unclassified.length) throw new Error(`${label} image inventory mismatch\nMissing:\n${missing.join('\n')}\nUnclassified:\n${unclassified.join('\n')}`)
}

function outputName(index, name) { return `${String(index + 1).padStart(2, '0')}-${name}` }

function generatedSource(galleries, teamCollab, credentialImages) {
  const keys = Object.keys(galleries).map((key) => `'${key}'`).join(' | ')
  return `// Generated by scripts/optimize-images.mjs. Do not edit by hand.\n` +
    `export type GallerySlide = { src: string; thumb: string; width: number; height: number; alt: string; caption: string }\n\n` +
    `export const galleries = ${JSON.stringify(galleries, null, 2)} as Record<${keys}, GallerySlide[]>\n\n` +
    `export type GalleryKey = keyof typeof galleries\n` +
    `export const teamCollab: GallerySlide[] = ${JSON.stringify(teamCollab, null, 2)}\n` +
    `export const credentialImages = ${JSON.stringify(credentialImages, null, 2)} as Record<string, GallerySlide>\n`
}

const expectedCertificates = certificateImages.map(({ file }) => file)
await verifyInventory(sourceRoot, allSources, 'Project')
await verifyInventory(path.join(root, 'public/certificates'), expectedCertificates, 'Certificate')

const galleries = {}
let optimizedCount = 0
for (const [slug, items] of Object.entries(sourceGroups)) {
  const destination = path.join(outputRoot, slug)
  await mkdir(destination, { recursive: true })
  for (const name of await readdir(destination)) if (/\.webp$/i.test(name)) await unlink(path.join(destination, name))
  galleries[slug] = []
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const base = outputName(index, item.name)
    const fullPath = path.join(destination, `${base}.webp`)
    const thumbPath = path.join(destination, `${base}-thumb.webp`)
    const full = await sharp(path.join(sourceRoot, item.file)).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(fullPath)
    await sharp(path.join(sourceRoot, item.file)).rotate().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(thumbPath)
    const slide = { src: `media/projects/${slug}/${base}.webp`, thumb: `media/projects/${slug}/${base}-thumb.webp`, width: full.width, height: full.height, alt: item.alt, caption: item.caption }
    await Promise.all([slide.src, slide.thumb].map((file) => access(path.join(root, 'public', file))))
    galleries[slug].push(slide)
    optimizedCount += 1
  }
}

const teamOutput = path.join(outputRoot, 'team-collaboration')
await mkdir(teamOutput, { recursive: true })
for (const name of await readdir(teamOutput)) if (/\.webp$/i.test(name)) await unlink(path.join(teamOutput, name))
const teamCollab = []
for (let index = 0; index < teamPhotos.length; index += 1) {
  const item = teamPhotos[index]
  const base = outputName(index, item.name)
  const fullPath = path.join(teamOutput, `${base}.webp`)
  const thumbPath = path.join(teamOutput, `${base}-thumb.webp`)
  const full = await sharp(path.join(sourceRoot, item.file)).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(fullPath)
  await sharp(path.join(sourceRoot, item.file)).rotate().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(thumbPath)
  teamCollab.push({ src: `media/projects/team-collaboration/${base}.webp`, thumb: `media/projects/team-collaboration/${base}-thumb.webp`, width: full.width, height: full.height, alt: item.alt, caption: item.caption })
}

const credentialsOutput = path.join(root, 'public/media/credentials')
await mkdir(credentialsOutput, { recursive: true })
for (const name of await readdir(credentialsOutput)) if (/\.webp$/i.test(name)) await unlink(path.join(credentialsOutput, name))
const optimizedCredentials = {}
for (let index = 0; index < certificateImages.length; index += 1) {
  const item = certificateImages[index]
  const base = `${String(index + 1).padStart(2, '0')}-${item.id}`
  const fullPath = path.join(credentialsOutput, `${base}.webp`)
  const thumbPath = path.join(credentialsOutput, `${base}-thumb.webp`)
  const full = await sharp(path.join(root, 'public/certificates', item.file)).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(fullPath)
  await sharp(path.join(root, 'public/certificates', item.file)).rotate().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(thumbPath)
  const slide = { src: `media/credentials/${base}.webp`, thumb: `media/credentials/${base}-thumb.webp`, width: full.width, height: full.height, alt: item.alt, caption: item.caption }
  await Promise.all([slide.src, slide.thumb].map((file) => access(path.join(root, 'public', file))))
  optimizedCredentials[item.id] = slide
}

await writeFile(generatedPath, generatedSource(galleries, teamCollab, optimizedCredentials))
console.log(`Optimized ${optimizedCount} project images, ${teamCollab.length} team photos, and ${certificateImages.length} certificates into WebP galleries.`)
console.log(`All ${allSources.length} project source images and ${expectedCertificates.length} certificate images are included; originals remain untouched.`)
console.log(`Wrote ${path.relative(root, generatedPath)}.`)

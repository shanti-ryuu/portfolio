import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const distDirectory = join(scriptDirectory, '..', 'dist')
const appShell = join(distDirectory, 'index.html')
// GitHub Pages serves this app shell for client-side routes. Create real
// directory entry points for known routes so deep links return HTTP 200;
// retain 404.html for unknown paths.
await copyFile(appShell, join(distDirectory, '404.html'))

const projectSource = await readFile(join(scriptDirectory, '..', 'src', 'data', 'projects.ts'), 'utf8')
const projectSlugs = [...projectSource.matchAll(/^\s+slug:\s*'([^']+)'/gm)].map((match) => match[1])
const routes = [
  'about',
  'tech-stack',
  'projects',
  'credentials',
  'achievements',
  'contact',
  ...projectSlugs.map((slug) => `projects/${slug}`),
]

for (const route of routes) {
  const routeEntry = join(distDirectory, route, 'index.html')
  await mkdir(dirname(routeEntry), { recursive: true })
  await copyFile(appShell, routeEntry)
}

// Preserve the existing legacy route aliases.
for (const route of ['certifications', 'tech-stack.html']) {
  const aliasPath = join(distDirectory, `${route}${route.endsWith('.html') ? '' : '/index.html'}`)
  await mkdir(dirname(aliasPath), { recursive: true })
  await copyFile(appShell, aliasPath)
}

console.log(`Created GitHub Pages entry points for ${routes.length} routes and 2 aliases.`)

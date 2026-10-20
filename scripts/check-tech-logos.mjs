import { readFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'

const data = await readFile(new URL('../src/data/techStack.ts', import.meta.url), 'utf8')
const registry = await readFile(new URL('../src/data/techLogoRegistry.ts', import.meta.url), 'utf8')
const logoComponent = await readFile(new URL('../src/components/TechLogo.tsx', import.meta.url), 'utf8')
const logoIds = [...data.matchAll(/logo:\s*'([^']+)'/g)].map((match) => match[1])
const registeredIds = new Set([...registry.matchAll(/(['\w-]+):\s*\{ kind:/g)].map((match) => match[1].replaceAll("'", '')))
const logoUrlSource = logoComponent.match(/const logoUrls:[^=]+=\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
const renderedIds = new Set([...logoUrlSource.matchAll(/(?:'([^']+)'|([\w-]+)):\s*[\w-]+/g)].map((match) => match[1] ?? match[2]))
const errors = []

const registryEntries = new Map([...registry.matchAll(/(['\w-]+):\s*\{ kind: '(simple|devicon|fallback)'(?:, path: '([^']+)')? \}/g)].map((match) => [match[1].replaceAll("'", ''), `${match[2]}:${match[3] ?? 'neutral'}`]))
const glyphOwners = new Map()

for (const logoId of logoIds) {
  if (!registeredIds.has(logoId)) errors.push(`No logo registry entry for "${logoId}".`)
  if (!renderedIds.has(logoId) && !registry.includes(`${logoId}: { kind: 'fallback' }`)) errors.push(`No rendered logo URL or fallback for "${logoId}".`)
  const glyph = registryEntries.get(logoId)
  if (glyph && glyph !== 'fallback:neutral') {
    if (glyphOwners.has(glyph)) errors.push(`Technologies "${glyphOwners.get(glyph)}" and "${logoId}" share the same logo glyph (${glyph}).`)
    else glyphOwners.set(glyph, logoId)
  }
}

for (const [, logoId, asset] of registry.matchAll(/(['\w-]+):\s*\{ kind: 'simple', path: '([^']+)' \}/g)) {
  try { await access(new URL(`../src/assets/tech/${asset}`, import.meta.url), constants.R_OK) }
  catch { errors.push(`Simple Icons SVG for "${logoId}" is missing: ${asset}.`) }
}

for (const [, logoId, asset] of registry.matchAll(/(['\w-]+):\s*\{ kind: 'devicon', path: '([^']+)' \}/g)) {
  try { await access(new URL(`../src/assets/tech/${asset}`, import.meta.url), constants.R_OK) }
  catch { errors.push(`Local Devicon asset for "${logoId}" is missing: ${asset}.`) }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Tech logo check passed (${new Set(logoIds).size} logo IDs, ${logoIds.length} technology records).`)
}

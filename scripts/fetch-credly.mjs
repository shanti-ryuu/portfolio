import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const jsonPath = path.join(root, 'src/data/credly.generated.json')
const badgeDir = path.join(root, 'public/badges')
const base = 'https://www.credly.com/users/joshua-santelices/badges.json'

try {
  const all = []
  let url = base
  while (url) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Credly returned HTTP ${response.status}`)
    const page = await response.json()
    for (const item of page.data ?? []) {
      const template = item.badge_template ?? {}
      all.push({ id: item.id, name: template.name, issuer: item.issuer?.entities?.find((entry) => entry.primary)?.entity?.name ?? item.issuer?.entities?.[0]?.entity?.name ?? '', issued_at_date: item.issued_at_date ?? null, url: template.url ?? `https://www.credly.com/users/joshua-santelices/badges/${item.id}`, image_url: template.image_url ?? null })
    }
    url = page.metadata?.next_page_url ? new URL(page.metadata.next_page_url, url).href : null
  }
  await mkdir(badgeDir, { recursive: true })
  for (const badge of all) {
    if (!badge.image_url) continue
    const response = await fetch(badge.image_url)
    if (!response.ok) throw new Error(`Badge image fetch failed for ${badge.id}: HTTP ${response.status}`)
    await writeFile(path.join(badgeDir, `${badge.id}.png`), Buffer.from(await response.arrayBuffer()))
  }
  await writeFile(jsonPath, `${JSON.stringify(all.map(({ image_url: _imageUrl, ...badge }) => badge), null, 2)}\n`)
  console.log(`Fetched ${all.length} Credly badges.`)
} catch (error) {
  try { await readFile(jsonPath, 'utf8'); console.warn(`Credly refresh failed; using the committed snapshot: ${error.message}`) }
  catch { console.warn(`Credly refresh failed and there is no committed snapshot yet: ${error.message}`) }
}

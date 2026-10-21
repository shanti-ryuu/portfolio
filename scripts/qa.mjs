import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from 'playwright'

const root = process.cwd()
const output = path.join(root, 'qa-screenshots')
await mkdir(output, { recursive: true })
const routes = [
  '/', '/about', '/tech-stack', '/projects', '/projects/grain-solar-rice-dryer',
  '/projects/scentryx', '/projects/dominotes', '/credentials', '/achievements', '/contact',
]
const widths = [1440, 1280, 768, 390, 360]
const engines = [['chromium', chromium], ['webkit', webkit]]
const failures = []
const rightOverflowNodes = new Set()
const containerEdges = new Map()
let devServer
try {
  devServer = (await import('node:child_process')).spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--strictPort'], { cwd: root, stdio: 'ignore' })
  let ready = false
  for (let n = 0; n < 60; n++) {
    try { const response = await fetch('http://127.0.0.1:5173'); if (response.ok) { ready = true; break } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Vite dev server did not start at http://127.0.0.1:5173')

  for (const [engineName, engine] of engines) {
    const browser = await engine.launch({ headless: true })
    for (const route of routes) for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
      const browserMessages = []
      page.on('response', (response) => { if (response.status() === 404 && /media\/cat-dancing/.test(response.url())) failures.push(`${engineName}-${width}-${route}: cat media 404 ${response.url()}`) })
      page.on('console', (message) => { if (message.type() === 'error' || message.type() === 'warning') browserMessages.push(`${message.type()}: ${message.text()}`) })
      page.on('pageerror', (error) => browserMessages.push(`pageerror: ${error.message}`))
      const label = `${engineName}-${width}-${route.replaceAll('/', '_') || 'home'}`
      try {
        const response = await page.goto(`http://127.0.0.1:5173/portfolio${route}`, { waitUntil: 'networkidle', timeout: 30000 })
        if (!response?.ok()) failures.push(`${label}: HTTP ${response?.status() ?? 'no response'}`)
        await page.waitForTimeout(300)
        await page.screenshot({ path: path.join(output, `${label}-top.jpg`), type: 'jpeg', quality: 72 })
        const top = await page.evaluate(() => {
          const width = innerWidth
          const overflow = document.documentElement.scrollWidth > width || document.body.scrollWidth > width
          const clipped = [...document.querySelectorAll('body *')].filter((node) => node instanceof HTMLElement && node.getBoundingClientRect().right > width + 1).map((node) => `${node.tagName.toLowerCase()}${node.className && typeof node.className === 'string' ? `.${node.className.trim().replaceAll(/\s+/g, '.')}` : ''} right=${Math.round(node.getBoundingClientRect().right)}`).slice(0, 20)
          const cats = [...document.querySelectorAll('[data-cat], .pixel-cat')].filter((cat) => cat.classList.contains('pixel-cat') || cat.querySelector('img,video')).map((cat) => {
            const a = cat.getBoundingClientRect()
            const bad = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,[data-card],[role="tab"]')].filter((item) => !item.closest('.site-header')).some((item) => item !== cat && (() => { const b = item.getBoundingClientRect(); return a.width > 0 && b.width > 0 && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top })())
            return { bad, box: [a.x, a.y, a.width, a.height] }
          })
          const text = document.body.innerText.toLowerCase()
          const catHealth = [...document.querySelectorAll('[data-cat]')].map((cat) => {
            const r = cat.getBoundingClientRect()
            const poster = cat.querySelector('img')
            const video = cat.querySelector('video')
            const videoVisible = video instanceof HTMLVideoElement && Number(getComputedStyle(video).opacity) > .01 && getComputedStyle(video).visibility !== 'hidden'
            const posterVisible = poster instanceof HTMLImageElement && poster.complete && poster.naturalWidth > 0 && getComputedStyle(poster).display !== 'none' && getComputedStyle(poster).visibility !== 'hidden' && !videoVisible
            const playing = video instanceof HTMLVideoElement && video.readyState >= 2 && !video.paused
            return { size: r.width > 0 && r.height > 0, media: posterVisible || playing, box: [r.x, r.y, r.width, r.height] }
          })
          const filterMasks = [...document.querySelectorAll('.tech-filter-row,.tech-status-row,.credential-toolbar')].map((row) => getComputedStyle(row).maskImage)
          const edge = document.querySelector('.page-shell')?.getBoundingClientRect().left ?? document.querySelector('.hero-inner')?.getBoundingClientRect().left ?? null
          const projectRows = (() => {
            const cards = [...document.querySelectorAll('.project-grid > .project-card')]
            const rows = new Map()
            for (const card of cards) { const r = card.getBoundingClientRect(); const k = Math.round(r.top); rows.set(k, [...(rows.get(k) ?? []), { top:r.top, height:r.height }]) }
            return [...rows.values()].map((row) => ({ tops:row.map((x) => x.top), heights:row.map((x) => x.height) }))
          })()
          const blocks = width < 768 ? (() => {
            const root = document.querySelector('.page-shell') ?? document.querySelector('.home-scroll-scene')
            if (!root) return []
            const children = [...root.children].filter((node) => { const r=node.getBoundingClientRect(), s=getComputedStyle(node); return r.width>0 && r.height>0 && s.position!=='fixed' && !node.matches('[data-cat],.pixel-cat') })
            const sorted = children.map((node) => ({name:node.className?.toString?.() ?? node.tagName, top:node.getBoundingClientRect().top, bottom:node.getBoundingClientRect().bottom})).sort((a,b)=>a.top-b.top)
            return sorted.slice(1).map((b,i)=>({from:sorted[i].name,to:b.name,gap:Math.round(b.top-sorted[i].bottom)})).filter((x)=>x.gap>140)
          })() : []
          return { width, scrollWidth: document.documentElement.scrollWidth, overflow, clipped, cats, catHealth, filterMasks, edge, projectRows, blocks, draft: ['todo','tbd','update when confirmed','placeholder'].filter((term) => text.includes(term)), modal: !!document.querySelector('[role="dialog"]') }
        })
        top.clipped.forEach((node) => rightOverflowNodes.add(`${width}px ${route}: ${node}`))
        if (top.edge !== null) containerEdges.set(`${engineName}-${width}-${route}`, top.edge)
        if (top.overflow) failures.push(`${label}: document scrollWidth ${top.scrollWidth} exceeds viewport ${width}`)
        if (top.cats.some((cat) => cat.bad)) failures.push(`${label}: cat overlaps text or controls`)
        if (top.draft.length) failures.push(`${label}: draft text ${top.draft.join(', ')}`)
        if (top.catHealth.some((cat) => !cat.size || !cat.media)) failures.push(`${label}: cat missing size, loaded poster, or playable video ${JSON.stringify(top.catHealth.filter((cat) => !cat.size || !cat.media))}`)
        if (width >= 768 && top.filterMasks.some((mask) => mask !== 'none')) failures.push(`${label}: filter row has desktop mask-image ${top.filterMasks.join(', ')}`)
        if (top.projectRows.some((row) => Math.max(...row.tops)-Math.min(...row.tops)>1 || Math.max(...row.heights)-Math.min(...row.heights)>1)) failures.push(`${label}: project row cards differ in top or height`)
        if (top.blocks.length) failures.push(`${label}: mobile blank gaps over 140px ${JSON.stringify(top.blocks)}`)

        // Capture the requested scrolled state and run the same DOM checks there.
        await page.evaluate(() => window.scrollTo({ top: Math.max(0, document.documentElement.scrollHeight * .55), behavior: 'instant' }))
        await page.waitForTimeout(300)
        await page.screenshot({ path: path.join(output, `${label}-scrolled.jpg`), type: 'jpeg', quality: 72 })
        const scrolled = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth || document.body.scrollWidth > innerWidth, cats: [...document.querySelectorAll('[data-cat], .pixel-cat')].filter((cat) => cat.classList.contains('pixel-cat') || cat.querySelector('img,video')).some((cat) => { const a = cat.getBoundingClientRect(); return [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,[data-card],[role="tab"]')].filter((item) => !item.closest('.site-header')).some((item) => { const b = item.getBoundingClientRect(); return a.width > 0 && b.width > 0 && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top }) }) }))
        if (scrolled.overflow || scrolled.cats) failures.push(`${label} scrolled: overflow or cat overlap`)

        if (route === '/' && width >= 768) {
          for (const fraction of [0, .5, 1]) {
            await page.evaluate((value) => scrollTo(0, (document.documentElement.scrollHeight-innerHeight)*value), fraction)
            await page.waitForTimeout(180)
            const opacity = await page.locator('.model-frame').first().evaluate((node) => Number(getComputedStyle(node).opacity))
            if (opacity < .95) failures.push(`${label}: desktop model opacity ${opacity} at ${fraction * 100}% scroll`)
          }
          await page.evaluate(() => scrollTo(0,0))
        }

        // Exercise a viewer on evidence and project routes, including the modal close target.
        if (route === '/credentials' || route === '/achievements' || route === '/projects' || route.startsWith('/projects/')) {
          const trigger = route === '/credentials' || route === '/achievements' ? page.locator('.credential-card').first() : page.locator('.gallery-image-trigger').first()
          if (!(await trigger.count())) failures.push(`${label}: expected modal trigger is missing`)
          else {
            await trigger.click({ timeout: 10000 }).catch((error) => failures.push(`${label}: could not open modal: ${error.message}`))
            const dialog = page.locator('[role="dialog"]')
            if (!(await dialog.count())) failures.push(`${label}: modal did not open`)
            else {
              const check = await page.evaluate(() => {
                const close = document.querySelector('.gallery-close')
                if (!(close instanceof HTMLElement)) return false
                const r = close.getBoundingClientRect()
                const x = r.left + r.width / 2
                const y = r.top + r.height / 2
                return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && document.elementFromPoint(x, y) === close
              })
              if (!check) failures.push(`${label}: modal close button is not visible and topmost`)
              await page.keyboard.press('Escape')
            }
          }
        }
        if (browserMessages.length) failures.push(`${label}: ${browserMessages.join(' | ')}`)
      } catch (error) { failures.push(`${label}: ${error.message}`) }
      await page.close()
    }
    await browser.close()
  }
} finally {
  devServer?.kill('SIGTERM')
}

console.log(`QA screenshots saved to ${output}`)
if (rightOverflowNodes.size) console.log(`Elements with right > viewport (reported):\n${[...rightOverflowNodes].slice(0,80).map((item)=>`- ${item}`).join('\n')}`)
for (const width of widths) {
  const edges=[...containerEdges].filter(([key])=>key.includes(`-${width}-`)).map(([,edge])=>edge)
  if (edges.length && Math.max(...edges)-Math.min(...edges)>1) failures.push(`${width}px shared container left edge differs across routes: ${edges.join(', ')}`)
}
const rightOverflow = [...new Set(failures.flatMap((finding) => {
  const match = finding.match(/overflow .*"clipped":(\[[^\]]*\])/)
  if (!match) return []
  try { return JSON.parse(match[1]) } catch { return [] }
}))]
if (rightOverflow.length) console.log(`Elements extending past the viewport (including contained and intentional scroll regions):\n${rightOverflow.map((item) => `- ${item}`).join('\n')}`)
if (failures.length) {
  console.error(`QA failed (${failures.length} findings):\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exitCode = 1
} else console.log('QA passed across all routes, viewports, and browser engines.')

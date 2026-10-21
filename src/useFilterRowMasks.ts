import { useEffect } from 'react'

export default function useFilterRowMasks() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('.tech-filter-row, .tech-status-row, .credential-toolbar'))
    const update = (row: HTMLElement) => {
      if (innerWidth >= 768) {
        row.style.maskImage = 'none'
        row.style.webkitMaskImage = 'none'
        return
      }
      const left = row.scrollLeft > 0
      const right = row.scrollWidth - row.scrollLeft - row.clientWidth > 1
      const stops = [left ? 'transparent 0' : 'black 0', left ? 'black 16px' : 'black 0', right ? 'black calc(100% - 16px)' : 'black 100%', right ? 'transparent 100%' : 'black 100%']
      const mask = `linear-gradient(to right, ${stops.join(', ')})`
      row.style.maskImage = mask
      row.style.webkitMaskImage = mask
    }
    const cleanups: Array<() => void> = []
    for (const row of rows) {
      const handle = () => update(row)
      row.addEventListener('scroll', handle, { passive: true })
      cleanups.push(() => row.removeEventListener('scroll', handle))
      update(row)
    }
    const resize = () => rows.forEach(update)
    window.addEventListener('resize', resize)
    return () => { cleanups.forEach((cleanup) => cleanup()); window.removeEventListener('resize', resize) }
  }, [])
}

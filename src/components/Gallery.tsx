import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { GallerySlide } from '../data/gallery.generated'

type GalleryProps = {
  images: readonly GallerySlide[]
  label: string
  compact?: boolean
  emptyMessage?: string
  initialIndex?: number
  startInLightbox?: boolean
  onClose?: () => void
  returnFocus?: () => void
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

const pad = (number: number) => String(number).padStart(2, '0')

export default function Gallery({ images, label, compact = false, emptyMessage, initialIndex = 0, startInLightbox = false, onClose, returnFocus }: GalleryProps) {
  const [index, setIndex] = useState(initialIndex)
  const [lightboxOpen, setLightboxOpen] = useState(startInLightbox)
  const reducedMotion = Boolean(useReducedMotion())
  const regionRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([])
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)
  const onCloseRef = useRef(onClose)
  const returnFocusRef = useRef(returnFocus)
  useEffect(() => { onCloseRef.current = onClose; returnFocusRef.current = returnFocus }, [onClose, returnFocus])
  const activeIndex = images.length ? index % images.length : 0
  const active = images[activeIndex]

  const move = useCallback((amount: number) => {
    setIndex((current) => (current + amount + images.length) % images.length)
  }, [images.length])
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    onCloseRef.current?.()
  }, [])
  const onGalleryKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
    else if (event.key === 'Home') { event.preventDefault(); setIndex(0) }
    else if (event.key === 'End') { event.preventDefault(); setIndex(images.length - 1) }
  }

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIndex, reducedMotion])

  useEffect(() => {
    if (!active || images.length < 2) return
    const idleWindow = window as IdleWindow
    const preloadAdjacent = () => {
      for (const offset of [-1, 1]) {
        const slide = images[(activeIndex + offset + images.length) % images.length]
        if (!slide) continue
        const image = new Image()
        image.decoding = 'async'
        image.src = `${import.meta.env.BASE_URL}${slide.src}`
      }
    }
    let timer = 0
    const idleId = idleWindow.requestIdleCallback?.(preloadAdjacent, { timeout: 1600 })
    if (idleId === undefined) timer = window.setTimeout(preloadAdjacent, 250)
    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId)
      window.clearTimeout(timer)
    }
  }, [active, activeIndex, images])

  useEffect(() => {
    if (!lightboxOpen) return
    const previousOverflow = document.body.style.overflow
    const returnFocusTarget = triggerRef.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeLightbox() }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
      else if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
      else if (event.key === 'Home') { event.preventDefault(); setIndex(0) }
      else if (event.key === 'End') { event.preventDefault(); setIndex(images.length - 1) }
      else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'))
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusRef.current?.()
      returnFocusTarget?.focus()
    }
  }, [closeLightbox, images.length, lightboxOpen, move])

  if (!active) return <div className={`gallery-empty glass-panel${compact ? ' gallery-empty-compact' : ''}`}>
    <span className="eyebrow">GALLERY</span>
    <p>{emptyMessage ?? 'No images are available in this gallery.'}</p>
  </div>

  const imageUrl = `${import.meta.env.BASE_URL}${active.src}`
  const imageStyle = { '--gallery-image': `url("${imageUrl}")` } as CSSProperties
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
    didSwipe.current = false
  }
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return
    const dx = event.clientX - pointerStart.current.x
    const dy = event.clientY - pointerStart.current.y
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true
      move(dx < 0 ? 1 : -1)
    }
    pointerStart.current = null
  }
  const openLightbox = () => {
    if (didSwipe.current) { didSwipe.current = false; return }
    setLightboxOpen(true)
  }
  return <>
    {!startInLightbox && <section ref={regionRef} className={`gallery${compact ? ' gallery-compact' : ''}`} role="region" aria-roledescription="carousel" aria-label={`${label} screenshots`} tabIndex={0} onKeyDown={onGalleryKeyDown}>
      <div className="gallery-stage glass-panel" style={imageStyle} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { pointerStart.current = null }}>
        <div className="gallery-stage-inner" role="group" aria-roledescription="slide" aria-label={`${activeIndex + 1} of ${images.length}`}>
          <button ref={triggerRef} type="button" className="gallery-image-trigger" onClick={openLightbox} aria-label={`Open screenshot ${activeIndex + 1} of ${images.length}: ${active.caption}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.img key={active.src} className="gallery-image" src={imageUrl} width={active.width} height={active.height} alt={active.alt} loading="eager" decoding="async" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .16 }} draggable={false} />
            </AnimatePresence>
          </button>
          <div className="gallery-controls">
            <button type="button" className="gallery-control" onClick={() => move(-1)} aria-label="Previous screenshot"><span aria-hidden="true">←</span></button>
            <span className="gallery-counter" aria-live="polite" aria-atomic="true">{pad(activeIndex + 1)} <span aria-hidden="true">/</span> {pad(images.length)}</span>
            <button type="button" className="gallery-control" onClick={() => move(1)} aria-label="Next screenshot"><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
      <p className="gallery-caption">{active.caption}</p>
      <div className="gallery-thumbnails" role="list" aria-label="Choose a screenshot">
        {images.map((slide, slideIndex) => <div role="listitem" className="gallery-thumb-item" key={slide.src}>
          <button ref={(element) => { thumbnailRefs.current[slideIndex] = element }} type="button" className={`gallery-thumb${slideIndex === activeIndex ? ' is-active' : ''}`} aria-current={slideIndex === activeIndex ? 'true' : undefined} aria-label={`Show screenshot ${slideIndex + 1}: ${slide.caption}`} onClick={() => setIndex(slideIndex)}>
            <img src={`${import.meta.env.BASE_URL}${slide.thumb}`} width="120" height="76" alt="" loading={slideIndex === activeIndex ? 'eager' : 'lazy'} decoding="async" />
            <span>{pad(slideIndex + 1)}</span>
          </button>
        </div>)}
      </div>
      <div className="gallery-dots" aria-label="Choose screenshot">
        {images.map((slide, slideIndex) => <button key={slide.src} type="button" className={`gallery-dot${slideIndex === activeIndex ? ' is-active' : ''}`} onClick={() => setIndex(slideIndex)} aria-label={`Show screenshot ${slideIndex + 1}`} aria-current={slideIndex === activeIndex ? 'true' : undefined} />)}
      </div>
      <div className="gallery-preload" aria-hidden="true">
        {[-1, 1].map((offset) => {
          const slide = images[(activeIndex + offset + images.length) % images.length]
          return slide ? <img key={slide.src} src={`${import.meta.env.BASE_URL}${slide.src}`} width={slide.width} height={slide.height} alt="" loading="eager" decoding="async" /> : null
        })}
      </div>
    </section>}

    {lightboxOpen && <div className="gallery-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeLightbox() }}>
      <div ref={dialogRef} className="gallery-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-lightbox-title">
        <div className="gallery-lightbox-header"><h2 id="gallery-lightbox-title">{label}</h2><button ref={closeRef} type="button" className="gallery-control gallery-close" onClick={closeLightbox} aria-label="Close full-screen image">×</button></div>
        <div className="gallery-lightbox-stage" style={imageStyle} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { pointerStart.current = null }}>
          <button type="button" className="gallery-image-trigger" onClick={() => { if (didSwipe.current) { didSwipe.current = false; return } closeLightbox() }} aria-label="Close full-screen image">
            <AnimatePresence mode="wait" initial={false}><motion.img key={active.src} className="gallery-lightbox-image" src={imageUrl} width={active.width} height={active.height} alt={active.alt} loading="eager" decoding="async" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .16 }} /></AnimatePresence>
          </button>
          <button type="button" className="gallery-control gallery-lightbox-prev" onClick={() => move(-1)} aria-label="Previous screenshot"><span aria-hidden="true">←</span></button>
          <button type="button" className="gallery-control gallery-lightbox-next" onClick={() => move(1)} aria-label="Next screenshot"><span aria-hidden="true">→</span></button>
        </div>
        <p className="gallery-lightbox-caption">{active.caption}</p>
        <p className="gallery-counter" aria-live="polite" aria-atomic="true">{pad(activeIndex + 1)} / {pad(images.length)}</p>
      </div>
    </div>}
  </>
}

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'

type DancingCatProps = { src: string; poster: string; side?: 'left' | 'right' | 'center'; size?: number; className?: string; flipped?: boolean }
const activeVideos = new Set<HTMLVideoElement>()
const videoSlotEvent = 'portfolio-cat-video-slot-available'
const desktopSafari = typeof navigator !== 'undefined'
  && /Macintosh/i.test(navigator.userAgent)
  && !/Mobile/i.test(navigator.userAgent)
  && /AppleWebKit/i.test(navigator.userAgent)
  && !/(Chrome|Chromium|Edg|OPR|Firefox)/i.test(navigator.userAgent)

function releaseVideo(video: HTMLVideoElement) {
  if (activeVideos.delete(video)) window.dispatchEvent(new Event(videoSlotEvent))
}

export default function DancingCat({ src, poster, side = 'center', size = 160, className = '', flipped = false }: DancingCatProps) {
  const reduceMotion = Boolean(useReducedMotion())
  const wrapperRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1024 : window.innerWidth)
  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const responsiveHidden = (className.includes('desktop-home-cat') && viewportWidth < 1024) || (className.includes('desktop') && !className.includes('desktop-home-cat') && viewportWidth < 768) || (className.includes('mobile') && viewportWidth >= 768)

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0), { threshold: [0, .01] })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const pause = () => { video.pause(); releaseVideo(video) }
    const syncPlayback = () => {
      if (reduceMotion || !inView || document.hidden || videoFailed) { pause(); return }
      if (!activeVideos.has(video) && activeVideos.size >= 2) return
      if (!video.paused && activeVideos.has(video)) return
      activeVideos.add(video)
      void video.play().then(() => setVideoReady(video.readyState >= 2 && !video.paused)).catch(() => {
        pause()
        setVideoReady(false)
        setVideoFailed(true)
      })
    }
    const onVisibility = () => syncPlayback()
    window.addEventListener(videoSlotEvent, syncPlayback)
    document.addEventListener('visibilitychange', onVisibility)
    syncPlayback()
    return () => { window.removeEventListener(videoSlotEvent, syncPlayback); document.removeEventListener('visibilitychange', onVisibility); pause() }
  }, [inView, reduceMotion, src, videoFailed])

  useEffect(() => {
    if (!videoReady) return
    const video = videoRef.current
    if (!video) return
    const update = () => setVideoReady(video.readyState >= 2)
    video.addEventListener('loadeddata', update)
    video.addEventListener('playing', update)
    video.addEventListener('error', () => { setVideoFailed(true); setVideoReady(false) }, { once: true })
    return () => { video.removeEventListener('loadeddata', update); video.removeEventListener('playing', update) }
  }, [videoReady])

  return <figure ref={wrapperRef} className={`dancing-cat dancing-cat-${side} ${className}`} data-cat={responsiveHidden ? undefined : ''} style={{ '--cat-size': `${size}px`, '--cat-flip': flipped ? -1 : 1 } as CSSProperties} aria-hidden="true">
    {!videoReady && <img className="dancing-cat-poster" src={poster} alt="" onError={(event) => { event.currentTarget.dataset.missing = 'true' }} />}
    {!reduceMotion && !desktopSafari && <video ref={videoRef} className={`dancing-cat-video${videoReady ? ' is-ready' : ''}`} src={src} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" onPlaying={() => setVideoReady(true)} onPause={() => setVideoReady(false)} onError={() => { setVideoFailed(true); setVideoReady(false) }} />}
  </figure>
}

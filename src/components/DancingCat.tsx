import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'
import { chromaKey } from '../chromaKey'

type DancingCatProps = { src: string; poster: string; side: 'left' | 'right'; size: number }

export default function DancingCat({ src, poster, side, size }: DancingCatProps) {
  const reduceMotion = Boolean(useReducedMotion())
  const wrapperRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio > 0)
    }, { threshold: [0, .01, 1] })
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !context) return

    let posterImage: HTMLImageElement | null = new Image()
    posterImage.onload = () => {
      if (reduceMotion || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) drawKeyed(posterImage)
    }
    posterImage.src = poster

    function drawKeyed(source: CanvasImageSource | null | undefined, width?: number, height?: number) {
      if (!canvas || !context || !source) return
      const sourceWidth = width ?? (source as HTMLVideoElement).videoWidth ?? (source as HTMLImageElement).naturalWidth
      const sourceHeight = height ?? (source as HTMLVideoElement).videoHeight ?? (source as HTMLImageElement).naturalHeight
      if (!sourceWidth || !sourceHeight) return
      if (canvas.width !== sourceWidth || canvas.height !== sourceHeight) { canvas.width = sourceWidth; canvas.height = sourceHeight }
      context.imageSmoothingEnabled = false
      context.clearRect(0, 0, sourceWidth, sourceHeight)
      context.drawImage(source, 0, 0, sourceWidth, sourceHeight)
      const frame = context.getImageData(0, 0, sourceWidth, sourceHeight)
      chromaKey(frame.data, sourceWidth, sourceHeight, true)
      context.putImageData(frame, 0, 0)
    }

    if (!video || reduceMotion) return () => { posterImage = null }

    let active = true
    let videoFrameId = 0
    let animationFrameId = 0
    const onLoadedData = () => drawKeyed(video)
    video.addEventListener('loadeddata', onLoadedData)
    const renderFrame = () => {
      if (!active || !inView || !tabVisible || document.hidden || video.paused || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
      drawKeyed(video)
      if ('requestVideoFrameCallback' in video) videoFrameId = video.requestVideoFrameCallback(renderFrame)
      else animationFrameId = requestAnimationFrame(renderFrame)
    }
    const playIfVisible = () => {
      video.muted = true
      video.loop = true
      video.playsInline = true
      if (inView && tabVisible && !document.hidden) {
        void video.play().then(renderFrame).catch(() => {})
      } else video.pause()
    }
    video.addEventListener('loadeddata', playIfVisible)
    playIfVisible()
    const retry = () => { video.muted = true; if (inView && tabVisible) void video.play().then(renderFrame).catch(() => {}) }
    window.addEventListener('pointerdown', retry, { once: true, passive: true })

    return () => {
      active = false
      video.pause()
      video.removeEventListener('loadeddata', onLoadedData)
      video.removeEventListener('loadeddata', playIfVisible)
      window.removeEventListener('pointerdown', retry)
      if (videoFrameId && 'cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(videoFrameId)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      posterImage = null
    }
  }, [poster, reduceMotion, inView, tabVisible])

  return <figure ref={wrapperRef} className={`dancing-cat dancing-cat-${side}`} style={{ '--cat-size': `${size}px` } as CSSProperties} aria-hidden="true">
    <video ref={videoRef} className="dancing-cat-video" src={src} poster={poster} muted loop playsInline autoPlay={inView && !reduceMotion} preload={reduceMotion ? 'none' : 'metadata'} controls={false} draggable={false} />
    <canvas ref={canvasRef} className="dancing-cat-canvas" />
  </figure>
}

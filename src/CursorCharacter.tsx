import { useCallback, useEffect, useRef, useState, type RefObject, type SyntheticEvent } from 'react'
import { useReducedMotion } from 'motion/react'
import { chromaKey } from './chromaKey'

type Direction = 'center' | 'left' | 'right' | 'up' | 'down' | 'up-left' | 'up-right' | 'down-left' | 'down-right'

const CLIPS: Record<Direction, string> = {
  center: 'idle-center.mp4',
  left: 'looking-left.mp4',
  right: 'looking-left-to-right.mp4',
  up: 'looking-up.mp4',
  down: 'looking-down.mp4',
  'up-left': 'looking-upleft.mp4',
  'up-right': 'looking-upright.mp4',
  'down-left': 'looking-downleft.mp4',
  'down-right': 'looking-downright.mp4',
}

const COMPATIBLE_VIDEO_ROOT = `${import.meta.env.BASE_URL}media/character-gaze-h264/`
const HIGH_QUALITY_VIDEO_ROOT = `${import.meta.env.BASE_URL}media/character-gaze.mp4/`
const hevcVideo = typeof document !== 'undefined'
  && document.createElement('video').canPlayType('video/mp4; codecs="hvc1"') !== ''
const clipUrl = (direction: Direction) => `${hevcVideo ? HIGH_QUALITY_VIDEO_ROOT : COMPATIBLE_VIDEO_ROOT}${CLIPS[direction]}`
const compatibleClipUrl = (direction: Direction) => `${COMPATIBLE_VIDEO_ROOT}${CLIPS[direction]}`

function directionAt(x: number, y: number, previous: Direction): Direction {
  const threshold = previous === 'center' ? 0.4 : 0.32
  const horizontal = Math.abs(x) < threshold ? '' : x < 0 ? 'left' : 'right'
  const vertical = Math.abs(y) < threshold ? '' : y < 0 ? 'up' : 'down'
  if (!horizontal && !vertical) return 'center'
  if (horizontal && vertical) return `${vertical}-${horizontal}` as Direction
  return (horizontal || vertical) as Direction
}

type Props = {
  className?: string
  interactionRegionRef: RefObject<HTMLElement | null>
  playbackRegionRef?: RefObject<HTMLElement | null>
}


export default function CursorCharacter({ className = '', interactionRegionRef, playbackRegionRef }: Props) {
  const reduceMotion = Boolean(useReducedMotion())
  const [direction, setDirection] = useState<Direction>('center')
  const [videoReady, setVideoReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [shouldPlay, setShouldPlay] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceContextRef = useRef<CanvasRenderingContext2D | null>(null)
  const loadedDirection = useRef<Direction | null>(null)
  const activeDirection = useRef<Direction>('center')
  const candidateDirection = useRef<Direction>('center')
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawLoopRef = useRef<() => void>(() => {})
  const cropTopRef = useRef<number | null>(null)
  const subjectBoundsRef = useRef<{ left: number; right: number } | null>(null)

  const selectDirection = useCallback((next: Direction) => {
    if (activeDirection.current === next) return
    activeDirection.current = next
    setDirection(next)
    setFailed(false)
  }, [])

  useEffect(() => {
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setVideoReady(true))
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [])

  useEffect(() => {
    const region = playbackRegionRef?.current ?? interactionRegionRef.current
    if (!region) return
    const observed = region.querySelector<HTMLElement>('.model-stage') ?? region
    let inView = true
    const update = () => setShouldPlay(inView && !document.hidden && !reduceMotion)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio > 0
      update()
    }, { threshold: [0, 0.01] })
    observer.observe(observed)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [interactionRegionRef, playbackRegionRef, reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const region = interactionRegionRef.current
    if (!region) return
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
      const target = region.querySelector<HTMLElement>('.model-stage') ?? region
      const bounds = target.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        if (dwellTimer.current) clearTimeout(dwellTimer.current)
        candidateDirection.current = 'center'
        leaveTimer.current = setTimeout(() => selectDirection('center'), 180)
        return
      }
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      const next = directionAt(x, y, candidateDirection.current)
      if (next === candidateDirection.current) return
      candidateDirection.current = next
      if (dwellTimer.current) clearTimeout(dwellTimer.current)
      dwellTimer.current = setTimeout(() => selectDirection(next), 210)
    }
    const handlePointerLeave = () => {
      if (dwellTimer.current) clearTimeout(dwellTimer.current)
      candidateDirection.current = 'center'
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
      leaveTimer.current = setTimeout(() => selectDirection('center'), 180)
    }
    region.addEventListener('pointermove', handlePointerMove, { passive: true })
    region.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      region.removeEventListener('pointermove', handlePointerMove)
      region.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [interactionRegionRef, reduceMotion, selectDirection])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoReady) return
    video.muted = true
    video.loop = true
    video.playsInline = true
    if (loadedDirection.current !== direction) {
      video.src = clipUrl(direction)
      loadedDirection.current = direction
      video.load()
    }
    if (reduceMotion || !shouldPlay) {
      video.pause()
      return
    }
    void video.play().catch(() => {})
  }, [direction, reduceMotion, shouldPlay, videoReady])

  useEffect(() => {
    if (!videoReady || reduceMotion) return
    const region = interactionRegionRef.current
    if (!region) return
    const retry = () => {
      const video = videoRef.current
      if (!video) return
      video.muted = true
      void video.play().catch(() => {})
    }
    region.addEventListener('pointerdown', retry, { once: true, passive: true })
    region.addEventListener('touchstart', retry, { once: true, passive: true })
    return () => {
      region.removeEventListener('pointerdown', retry)
      region.removeEventListener('touchstart', retry)
    }
  }, [interactionRegionRef, reduceMotion, videoReady])

  const drawFrame = useCallback(() => {
    const video = videoRef.current
    const visibleCanvas = canvasRef.current
    if (!video || !visibleCanvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth < 2) return

    const sourceWidth = video.videoWidth
    const sourceHeight = video.videoHeight
    // The supplied framing crops the forearm at the left edge; keep the full
    // width rather than inventing pixels. Re-export with >=8% margin around
    // the entire character (especially elbow/forearm) for the permanent fix.
    const cropX = 0
    // Keep the canvas close to the source's native 1080px height on desktop;
    // a 640px cap visibly softened the full-screen character. The source itself
    // remains the upper bound, so this never invents extra image detail.
    const targetHeight = window.innerWidth < 768
      ? 640
      : Math.min(1080, window.innerHeight * Math.min(window.devicePixelRatio || 1, 1.5))
    const outputScale = Math.min(1, targetHeight / sourceHeight)
    const cropWidth = Math.round(sourceWidth * outputScale)
    const cropHeight = Math.round(sourceHeight * outputScale)
    let sourceCanvas = sourceContextRef.current?.canvas
    if (!sourceCanvas || sourceCanvas.width !== cropWidth || sourceCanvas.height !== cropHeight) {
      sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = cropWidth
      sourceCanvas.height = cropHeight
      sourceContextRef.current = sourceCanvas.getContext('2d', { willReadFrequently: true })
    }
    const sourceContext = sourceContextRef.current
    const visibleContext = visibleCanvas.getContext('2d')
    if (!sourceContext || !visibleContext) return
    sourceContext.drawImage(video, cropX, 0, sourceWidth, sourceHeight, 0, 0, cropWidth, cropHeight)
    const frame = sourceContext.getImageData(0, 0, cropWidth, cropHeight)
    chromaKey(frame.data, cropWidth, cropHeight)
    sourceContext.putImageData(frame, 0, 0)
    if (cropTopRef.current === null && direction === 'center') {
      let top = cropHeight
      let bottom = 0
      let left = cropWidth
      let right = 0
      for (let y = 0; y < cropHeight; y += 1) {
        for (let x = 0; x < cropWidth; x += 1) {
          if (frame.data[(y * cropWidth + x) * 4 + 3] > 32) {
            top = Math.min(top, y)
            bottom = Math.max(bottom, y)
            left = Math.min(left, x)
            right = Math.max(right, x)
          }
        }
      }
      if (bottom > top) {
        const boundsHeight = bottom - top + 1
        // Keep the keyed subject at roughly 88% of the canvas height, with
        // the source's lower edge intact so the bust reaches the stage bottom.
        cropTopRef.current = Math.max(0, Math.round(top - boundsHeight * (0.12 / 0.88)))
        const boundsWidth = right - left + 1
        // Include additional room for the raised-hand gesture in the idle loop;
        // the first frame alone is narrower than its later arm poses.
        const sideMargin = boundsWidth * .22
        subjectBoundsRef.current = { left: Math.max(0, Math.floor(left - sideMargin)), right: Math.min(cropWidth, Math.ceil(right + sideMargin + 1)) }
      } else {
        cropTopRef.current = 0
      }
    }
    const cropTop = cropTopRef.current ?? 0
    const cropHeightVisible = cropHeight - cropTop
    const mobile = window.innerWidth < 768
    const subjectBounds = subjectBoundsRef.current
    const displayX = mobile && subjectBounds ? subjectBounds.left : 0
    const displayWidth = mobile && subjectBounds ? subjectBounds.right - subjectBounds.left : cropWidth
    if (visibleCanvas.width !== displayWidth || visibleCanvas.height !== cropHeightVisible) {
      visibleCanvas.width = displayWidth
      visibleCanvas.height = cropHeightVisible
    }
    visibleContext.clearRect(0, 0, displayWidth, cropHeightVisible)
    visibleContext.drawImage(sourceCanvas, displayX, cropTop, displayWidth, cropHeightVisible, 0, 0, displayWidth, cropHeightVisible)
  }, [direction])

  useEffect(() => {
    drawLoopRef.current = drawFrame
  }, [drawFrame])

  const onLoadedData = useCallback(() => {
    drawLoopRef.current()
    setFailed(false)
  }, [])

  const onError = useCallback((event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    const expected = new URL(clipUrl(activeDirection.current), document.baseURI).href
    if (!video.currentSrc || video.currentSrc !== expected) return
    if (hevcVideo && (!video.currentSrc || video.currentSrc.startsWith(new URL(HIGH_QUALITY_VIDEO_ROOT, document.baseURI).href))) {
      video.src = compatibleClipUrl(activeDirection.current)
      video.load()
      if (!reduceMotion && shouldPlay) void video.play().catch(() => {})
      return
    }
    setFailed(true)
  }, [reduceMotion, shouldPlay])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !videoReady || failed) return
    let active = true
    let frameId = 0
    let rafId = 0
    const draw = () => {
      if (!active || document.hidden) return
      drawLoopRef.current()
      if (shouldPlay && !reduceMotion) {
        if ('requestVideoFrameCallback' in video) {
          frameId = video.requestVideoFrameCallback(draw)
        } else {
          rafId = requestAnimationFrame(draw)
        }
      }
    }
    if (shouldPlay && !reduceMotion && 'requestVideoFrameCallback' in video) {
      frameId = video.requestVideoFrameCallback(draw)
    } else if (shouldPlay && !reduceMotion) {
      rafId = requestAnimationFrame(draw)
    } else {
      drawLoopRef.current()
    }
    return () => {
      active = false
      if (frameId && 'cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(frameId)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [direction, failed, reduceMotion, shouldPlay, videoReady])

  useEffect(() => () => {
    if (dwellTimer.current) clearTimeout(dwellTimer.current)
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }, [])

  return <div className={`character-composition ${className}`} aria-hidden="true">
    <video
      ref={videoRef}
      className="character-source"
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      onLoadedData={onLoadedData}
      onError={onError}
    />
    <canvas ref={canvasRef} className="character-media character-canvas" />
  </div>
}

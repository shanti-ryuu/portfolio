import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

export default function PixelCatCompanion() {
  const catRef = useRef<HTMLDivElement>(null)
  const reduceMotion = Boolean(useReducedMotion())

  useEffect(() => {
    const cat = catRef.current
    if (!cat || reduceMotion) return

    const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)')
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frame = 0
    let visible = !document.hidden

    const animate = () => {
      frame = 0
      if (!visible) return
      currentX += (targetX - currentX) * 0.075
      currentY += (targetY - currentY) * 0.075
      cat.style.setProperty('--cat-gaze-x', `${currentX.toFixed(2)}px`)
      cat.style.setProperty('--cat-gaze-y', `${currentY.toFixed(2)}px`)
      cat.style.setProperty('--cat-gaze-tilt', `${(currentX * 0.16).toFixed(2)}deg`)
      if (Math.abs(targetX - currentX) > 0.06 || Math.abs(targetY - currentY) > 0.06) {
        frame = window.requestAnimationFrame(animate)
      }
    }
    const schedule = () => {
      if (visible && !frame) frame = window.requestAnimationFrame(animate)
    }
    const onPointerMove = (event: MouseEvent) => {
      const bounds = cat.getBoundingClientRect()
      targetX = Math.max(-6, Math.min(6, (event.clientX - (bounds.left + bounds.width / 2)) / 42))
      targetY = Math.max(-5, Math.min(5, (event.clientY - (bounds.top + bounds.height / 2)) / 48))
      schedule()
    }
    const onVisibilityChange = () => {
      visible = !document.hidden
      cat.classList.toggle('pixel-cat-paused', !visible)
      if (!visible) window.cancelAnimationFrame(frame)
      else schedule()
    }
    const updatePointerMode = () => {
      window.removeEventListener('mousemove', onPointerMove)
      targetX = 0
      targetY = 0
      schedule()
      if (canTrackPointer.matches) window.addEventListener('mousemove', onPointerMove, { passive: true })
    }

    updatePointerMode()
    canTrackPointer.addEventListener('change', updatePointerMode)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onPointerMove)
      canTrackPointer.removeEventListener('change', updatePointerMode)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reduceMotion])

  return <div ref={catRef} className={`pixel-cat-companion${reduceMotion ? ' pixel-cat-reduced-motion' : ''}`} aria-hidden="true">
    <img className="pixel-cat-art" src={`${import.meta.env.BASE_URL}images/pixel-cat.png`} alt="" draggable="false" />
  </div>
}

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router-dom'

type Particle = { x: number; y: number; vx: number; vy: number; radius: number; color: string }
const contentColors = ['rgba(43,53,88,.35)', 'rgba(255,255,255,.35)', 'rgba(122,136,176,.35)']
const homeColors = ['rgba(43,53,88,.5)', 'rgba(255,255,255,.75)', 'rgba(122,136,176,.55)']
const random = (min: number, max: number) => min + Math.random() * (max - min)

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = Boolean(useReducedMotion())
  const { pathname } = useLocation()
  const contentRoute = !['/', '/portfolio', '/portfolio/'].includes(pathname)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0
    let pointer: { x: number; y: number } | null = null
    const desktop = window.matchMedia('(min-width: 768px)')

    const draw = (animate: boolean) => {
      context.clearRect(0, 0, width, height)
      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i]
        if (animate) {
          particle.x += particle.vx
          particle.y += particle.vy
          const catX = width - Math.max(26, width * 0.055) - (width < 768 ? 48 : 72)
          const catY = height - (width < 768 ? 64 : 78)
          const catDx = catX - particle.x
          const catDy = catY - particle.y
          const catDistance = Math.hypot(catDx, catDy)
          if (catDistance > 0 && catDistance < 155) {
            const direction = catDistance < 48 ? -1 : 1
            const strength = direction < 0 ? 0.009 : ((155 - catDistance) / 155) * 0.0015
            particle.vx += (catDx / catDistance) * strength * direction
            particle.vy += (catDy / catDistance) * strength * direction
          }
          if (pointer && desktop.matches) {
            const dx = pointer.x - particle.x
            const dy = pointer.y - particle.y
            const distance = Math.hypot(dx, dy)
            if (distance > 0 && distance < 140) {
              const pull = ((140 - distance) / 140) * 0.012
              particle.vx += (dx / distance) * pull
              particle.vy += (dy / distance) * pull
              particle.vx *= 0.995
              particle.vy *= 0.995
            }
          }
          particle.vx *= 0.999
          particle.vy *= 0.999
          const speed = Math.hypot(particle.vx, particle.vy)
          if (speed > 0.35) {
            particle.vx = particle.vx / speed * 0.35
            particle.vy = particle.vy / speed * 0.35
          }
          if (particle.x < -8) particle.x = width + 8
          if (particle.x > width + 8) particle.x = -8
          if (particle.y < -8) particle.y = height + 8
          if (particle.y > height + 8) particle.y = -8
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const first = particles[i]
        for (let j = i + 1; j < particles.length; j += 1) {
          const second = particles[j]
          const dx = first.x - second.x
          const dy = first.y - second.y
          if (dx * dx + dy * dy < 130 * 130) {
            context.strokeStyle = contentRoute ? 'rgba(43,53,88,.10)' : 'rgba(43,53,88,.16)'
            context.lineWidth = 1
            context.beginPath()
            context.moveTo(first.x, first.y)
            context.lineTo(second.x, second.y)
            context.stroke()
          }
        }
      }

      for (const particle of particles) {
        context.beginPath()
        context.fillStyle = particle.color
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const mobile = !desktop.matches
      const count = Math.min(mobile ? 28 : 70, Math.max(24, Math.round((width * height) / 18000)))
      particles = Array.from({ length: count }, () => {
        const angle = random(0, Math.PI * 2)
        const speed = random(0.15, 0.35)
        const palette = contentRoute ? contentColors : homeColors
        return { x: random(0, width), y: random(0, height), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: random(1.5, 3.5), color: palette[Math.floor(random(0, palette.length))] }
      })
      draw(false)
    }

    const animate = () => {
      if (document.hidden) return
      draw(true)
      frame = window.requestAnimationFrame(animate)
    }
    const start = () => {
      window.cancelAnimationFrame(frame)
      if (document.hidden || reducedMotion) {
        draw(false)
        return
      }
      frame = window.requestAnimationFrame(animate)
    }
    const handlePointer = (event: MouseEvent) => { pointer = { x: event.clientX, y: event.clientY } }
    const updateDeviceMode = () => {
      if (desktop.matches) window.addEventListener('mousemove', handlePointer, { passive: true })
      else {
        window.removeEventListener('mousemove', handlePointer)
        pointer = null
      }
      resize()
    }
    updateDeviceMode()
    start()
    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', start)
    desktop.addEventListener('change', updateDeviceMode)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handlePointer)
      document.removeEventListener('visibilitychange', start)
      desktop.removeEventListener('change', updateDeviceMode)
    }
  }, [contentRoute, reducedMotion])

  return <canvas ref={canvasRef} className="particle-background" aria-hidden="true" />
}

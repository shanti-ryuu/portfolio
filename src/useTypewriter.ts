import { useEffect, useState } from 'react'

export default function useTypewriter(text: string, reducedMotion: boolean) {
  const [length, setLength] = useState(reducedMotion ? text.length : 0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    if (length === text.length && !deleting) {
      const timer = window.setTimeout(() => setDeleting(true), 2200)
      return () => window.clearTimeout(timer)
    }
    if (length === 0 && deleting) {
      const timer = window.setTimeout(() => setDeleting(false), 500)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setLength((current) => current + (deleting ? -1 : 1)), deleting ? 28 : 55)
    return () => window.clearTimeout(timer)
  }, [deleting, length, reducedMotion, text])

  return text.slice(0, reducedMotion ? text.length : length)
}

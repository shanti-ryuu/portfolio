import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import type { TechItem } from '../data/techStack'
import { Link } from 'react-router-dom'
import TechLogo from './TechLogo'

type ProjectReference = { slug: string; title: string; planned: boolean }

export default function TechCard({ tech, compact = false, projectReferences = [] }: { tech: TechItem; compact?: boolean; projectReferences?: ProjectReference[] }) {
  const reducedMotion = Boolean(useReducedMotion())
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [sheetOpen, setSheetOpen] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!sheetOpen) return
    const previous = document.body.style.overflow
    const header = document.querySelector<HTMLElement>('.site-header')
    document.body.style.overflow = 'hidden'
    if (header) header.inert = true
    closeRef.current?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setSheetOpen(false); cardRef.current?.focus() }
      if (event.key === 'Tab' && sheetRef.current) {
        const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'))
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!first || !last) return
        if (!sheetRef.current.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); return }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = previous; if (header) header.inert = false }
  }, [sheetOpen])
  const statusText = tech.status === 'used' ? 'Used' : tech.status === 'exploring' ? 'Exploring' : 'Studied'
  const visibleProjects = projectReferences.slice(0, 2)
  const remainingProjects = projectReferences.length - visibleProjects.length
  return <><motion.article ref={cardRef} id={tech.id} tabIndex={0} role={mobile ? 'button' : undefined} aria-haspopup={mobile ? 'dialog' : undefined} aria-expanded={mobile ? sheetOpen : undefined} className={`tech-card glass-panel${compact ? ' tech-card-compact' : ''}`} onClick={(event) => { if (mobile && !(event.target instanceof Element && event.target.closest('a'))) setSheetOpen(true) }} onKeyDown={(event) => { if (mobile && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSheetOpen(true) } }} layout={!reducedMotion} initial={reducedMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: 4 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reducedMotion ? 0 : .18, ease: 'easeOut' }}>
    <div className="tech-card-heading"><TechLogo logo={tech.logo} name={tech.name} /><span className={`tech-status-chip status-${tech.status}`}>{statusText}</span></div>
    <h3>{tech.name}</h3><p>{tech.note}</p>
    {projectReferences.length > 0 && <div className="tech-card-projects"><span>{projectReferences.some((project) => !project.planned) ? 'Used in' : 'Planned for'}</span><div className="tech-card-project-links">{visibleProjects.map((project) => <Link to={`/projects/${project.slug}`} key={project.slug} title={project.title}>{project.title}{project.planned ? ' · planned' : ''}</Link>)}{remainingProjects > 0 && <span className="project-count">+{remainingProjects}</span>}</div></div>}
  </motion.article>{sheetOpen && createPortal(<div className="tech-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSheetOpen(false); cardRef.current?.focus() } }}><section ref={sheetRef} className="tech-detail-sheet glass-panel" role="dialog" aria-modal="true" aria-labelledby={`tech-sheet-${tech.id}`}><button ref={closeRef} className="tech-sheet-close" type="button" aria-label="Close technology details" onClick={() => { setSheetOpen(false); cardRef.current?.focus() }}>×</button><TechLogo logo={tech.logo} name={tech.name} /><h2 id={`tech-sheet-${tech.id}`}>{tech.name}</h2><span className={`tech-status-chip status-${tech.status}`}>{statusText}</span><p>{tech.note}</p>{projectReferences.length > 0 && <div className="tech-card-project-links">{visibleProjects.map((project) => <Link to={`/projects/${project.slug}`} key={project.slug}>{project.title}{project.planned ? ' · planned' : ''}</Link>)}{remainingProjects > 0 && <span className="project-count">+{remainingProjects}</span>}</div>}</section></div>, document.body)}</>
}

import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Gallery from '../components/Gallery'
import Reveal from '../components/Reveal'
import { credlyBadges } from '../data/badges'
import { credentialImage, credentials, credlyUrl, type CredentialCategory, type CredentialRecord } from '../data/credentials'
import type { GallerySlide } from '../data/gallery.generated'
import DancingCat from '../components/DancingCat'
import useFilterRowMasks from '../useFilterRowMasks'
import { motion, useReducedMotion } from 'motion/react'

const catMedia = `${import.meta.env.BASE_URL}media/cat-dancing/`
const safariCat = typeof navigator !== 'undefined' && /AppleWebKit/i.test(navigator.userAgent) && (/(iPhone|iPad|iPod|Macintosh.*Mobile)/i.test(navigator.userAgent) || !/(Chrome|Chromium|Edg|OPR|Firefox)/i.test(navigator.userAgent))

type CredentialFilter = 'all' | 'course' | 'participation'
const filterLabels: Array<{ id: CredentialFilter; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'course', label: 'Courses' }, { id: 'participation', label: 'Participation' },
]

function dateLabel(value: string | null) {
  if (!value) return null
  if (/^\d{4}$/.test(value)) return value
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

function categoryLabel(category: CredentialCategory) {
  return category === 'course' ? 'Course' : category === 'participation' ? 'Participation' : category === 'award' ? 'Award' : 'Academic'
}

function firstEvidence(record: CredentialRecord) {
  const evidence = record.evidence[0]
  return evidence ? credentialImage(evidence.imageKey) : null
}

function matchingBadge(record: CredentialRecord) {
  if (record.category !== 'course') return false
  const title = record.title.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return credlyBadges.some((badge) => {
    const name = badge.name.toLowerCase().replace(/[^a-z0-9]+/g, '')
    return title.includes(name) || name.includes(title) || ['cybersecurity', 'softwaredevelopment', 'iot', 'powerpoint'].some((term) => title.includes(term) && name.includes(term))
  })
}

function evidenceSlides(records: CredentialRecord[]): GallerySlide[] {
  return records.flatMap((record) => record.evidence.map((evidence) => {
    const image = credentialImage(evidence.imageKey)
    if (!image) throw new Error(`Missing generated certificate image: ${evidence.imageKey}`)
    return { ...image, alt: image.alt, caption: `${record.title} · ${evidence.caption}` }
  }))
}

function CredentialGrid({ records, category, emptyTitle }: { records: CredentialRecord[]; category: CredentialFilter | null; emptyTitle: string }) {
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null)
  const reducedMotion = Boolean(useReducedMotion())
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const slides = evidenceSlides(records)
  const positions = records.reduce<number[]>((result, _record, index) => {
    result[index] = (result[index - 1] ?? 0) + (index ? Math.max(1, records[index - 1].evidence.length) : 0)
    return result
  }, [])

  return <>
    {records.length ? <Reveal className="credential-grid-reveal"><div className="credential-grid">{records.map((record, index) => {
      const preview = firstEvidence(record)
      return <motion.button ref={(node) => { buttonRefs.current[record.id] = node }} type="button" className="credential-card glass-panel" key={record.id} onClick={() => setSelectedSlide(positions[index])} aria-label={`Open ${record.title} evidence`} initial={reducedMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: reducedMotion ? 0 : .32, delay: reducedMotion ? 0 : Math.min((index % 5) * .035, .14), ease: 'easeOut' }}>
        <span className="credential-card-media">
          {preview && <img src={`${import.meta.env.BASE_URL}${preview.thumb}`} alt={preview.alt} width={preview.width} height={preview.height} loading="lazy" decoding="async" />}
          {matchingBadge(record) && <span className="credly-verified-chip">Verified on Credly</span>}
        </span>
        <span className="credential-card-copy"><span className="credential-category-chip">{categoryLabel(record.category)}</span><strong>{record.title}</strong>
          {record.issuer && <span>{record.issuer}</span>}{dateLabel(record.date) && <time dateTime={record.date ?? undefined}>{dateLabel(record.date)}</time>}
          {record.context && <span>{record.context}</span>}
        </span>
      </motion.button>
    })}</div></Reveal> : <div className="credential-empty glass-panel"><span className="eyebrow">NO MATCHING RECORDS</span><h2>{emptyTitle}</h2><p>Choose another filter to see the available records.</p></div>}
    {selectedSlide !== null && <Gallery key={`${category ?? 'achievements'}-${selectedSlide}`} images={slides} label="Credential evidence" initialIndex={selectedSlide} startInLightbox onClose={() => setSelectedSlide(null)} returnFocus={() => {
      const recordIndex = positions.findIndex((position, index) => selectedSlide >= position && selectedSlide < position + Math.max(1, records[index].evidence.length))
      const record = records[Math.max(0, recordIndex)]
      if (record) buttonRefs.current[record.id]?.focus()
    }} />}
  </>
}

export default function CredentialsPage() {
  useFilterRowMasks()
  const [filter, setFilter] = useState<CredentialFilter>('all')
  const available = credentials.filter((record) => record.category === 'course' || record.category === 'participation')
  const records = filter === 'all' ? available : available.filter((record) => record.category === filter)
  const countFor = (value: CredentialFilter) => value === 'all' ? available.length : available.filter((record) => record.category === value).length
  return <main className="page-shell page-credentials">
    <header className="page-intro credential-hero"><div><span className="eyebrow">CREDENTIALS</span><h1>Learning, documented.</h1><p>Courses and participation records, with their certificate images.</p></div><DancingCat src={`${catMedia}damdamdidi.${safariCat ? 'mov' : 'webm'}`} poster={`${catMedia}damdamdidi-poster.png`} size={220} className="credentials-hero-cat" /></header>
    <section className="credentials-section" aria-label="Credentials">
      <div className="credential-toolbar" aria-label="Filter credentials">{filterLabels.map(({ id, label }) => <button type="button" className={`credential-filter${filter === id ? ' is-selected' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)} ref={(node) => { if (node && filter === id) node.scrollIntoView({ block: 'nearest', inline: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }} key={id}>{label}<span>{countFor(id)}</span></button>)}</div>
      <CredentialGrid records={records} category={filter} emptyTitle="No credentials in this filter." />
    </section>
    <Reveal><section className="credly-section glass-panel">
      <div className="credly-content"><span className="eyebrow">DIGITAL BADGES</span><h2>Credly profile</h2><p>{credlyBadges.length ? `${credlyBadges.length} confirmed badges are listed.` : 'Badges are not listed in this portfolio yet. Visit the public Credly profile to view current badges.'}</p>{credlyBadges.length > 0 && <ul className="credly-badge-list">{credlyBadges.map((badge) => <li key={badge.id}><img src={`${import.meta.env.BASE_URL}badges/${badge.id}.png`} alt="" width="72" height="72" loading="lazy" /><strong>{badge.name}</strong>{badge.issuer && <span>{badge.issuer}</span>}{dateLabel(badge.issued_at_date) && <time dateTime={badge.issued_at_date ?? undefined}>{dateLabel(badge.issued_at_date)}</time>}<a href={badge.url} target="_blank" rel="noopener noreferrer">View on Credly</a></li>)}</ul>}</div>
      <a className="button button-outline" href={credlyUrl} target="_blank" rel="noopener noreferrer">Open Credly <span aria-hidden="true">↗</span></a>
    </section></Reveal>
    <p className="credentials-crosslink">See <Link to="/achievements">awards and academic milestones <span aria-hidden="true">↗</span></Link>.</p>
  </main>
}

export { CredentialGrid }

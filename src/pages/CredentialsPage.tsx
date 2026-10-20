import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Gallery from '../components/Gallery'
import { credlyBadges } from '../data/badges'
import { credentialImage, credentials, credlyUrl, type CredentialCategory, type CredentialRecord } from '../data/credentials'
import type { GallerySlide } from '../data/gallery.generated'

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

function evidenceSlides(records: CredentialRecord[]): GallerySlide[] {
  return records.flatMap((record) => record.evidence.map((evidence) => {
    const image = credentialImage(evidence.imageKey)
    if (!image) throw new Error(`Missing generated certificate image: ${evidence.imageKey}`)
    return { ...image, alt: image.alt, caption: `${record.title} · ${evidence.caption}` }
  }))
}

function CredentialGrid({ records, category, emptyTitle }: { records: CredentialRecord[]; category: CredentialFilter | null; emptyTitle: string }) {
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const slides = evidenceSlides(records)
  const positions = records.reduce<number[]>((result, _record, index) => {
    result[index] = (result[index - 1] ?? 0) + (index ? Math.max(1, records[index - 1].evidence.length) : 0)
    return result
  }, [])

  return <>
    {records.length ? <div className="credential-grid">{records.map((record, index) => {
      const preview = firstEvidence(record)
      return <button ref={(node) => { buttonRefs.current[record.id] = node }} type="button" className="credential-card glass-panel" key={record.id} onClick={() => setSelectedSlide(positions[index])} aria-label={`Open ${record.title} evidence`}>
        <span className="credential-card-media">
          {preview && <img src={`${import.meta.env.BASE_URL}${preview.thumb}`} alt={preview.alt} width={preview.width} height={preview.height} loading="lazy" decoding="async" />}
        </span>
        <span className="credential-card-copy"><span className="credential-category-chip">{categoryLabel(record.category)}</span><strong>{record.title}</strong>
          {record.issuer && <span>{record.issuer}</span>}{dateLabel(record.date) && <time dateTime={record.date ?? undefined}>{dateLabel(record.date)}</time>}
          {record.context && <span>{record.context}</span>}
        </span>
      </button>
    })}</div> : <div className="credential-empty glass-panel"><span className="eyebrow">NO MATCHING RECORDS</span><h2>{emptyTitle}</h2><p>Choose another filter to see the available records.</p></div>}
    {selectedSlide !== null && <Gallery key={`${category ?? 'achievements'}-${selectedSlide}`} images={slides} label="Credential evidence" initialIndex={selectedSlide} startInLightbox onClose={() => setSelectedSlide(null)} returnFocus={() => {
      const recordIndex = positions.findIndex((position, index) => selectedSlide >= position && selectedSlide < position + Math.max(1, records[index].evidence.length))
      const record = records[Math.max(0, recordIndex)]
      if (record) buttonRefs.current[record.id]?.focus()
    }} />}
  </>
}

export default function CredentialsPage() {
  const [filter, setFilter] = useState<CredentialFilter>('all')
  const available = credentials.filter((record) => record.category === 'course' || record.category === 'participation')
  const records = filter === 'all' ? available : available.filter((record) => record.category === filter)
  const countFor = (value: CredentialFilter) => value === 'all' ? available.length : available.filter((record) => record.category === value).length
  return <main className="page-shell page-credentials">
    <header className="page-intro"><span className="eyebrow">CREDENTIALS</span><h1>Learning, documented.</h1><p>Courses and participation records, with their certificate images.</p></header>
    <section className="credentials-section" aria-label="Credentials">
      <div className="credential-toolbar" aria-label="Filter credentials">{filterLabels.map(({ id, label }) => <button type="button" className={`credential-filter${filter === id ? ' is-selected' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)} ref={(node) => { if (node && filter === id) node.scrollIntoView({ block: 'nearest', inline: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }} key={id}>{label}<span>{countFor(id)}</span></button>)}</div>
      <CredentialGrid records={records} category={filter} emptyTitle="No credentials in this filter." />
    </section>
    <section className="credly-section glass-panel">
      <div><span className="eyebrow">DIGITAL BADGES</span><h2>Credly profile</h2><p>{credlyBadges.length ? `${credlyBadges.length} confirmed badges are listed.` : 'The public profile could not be read, so no badges are listed here yet.'}</p>{credlyBadges.length > 0 && <ul className="credly-badge-list">{credlyBadges.map((badge) => <li key={badge.name}><strong>{badge.name}</strong>{badge.issuer && <span>{badge.issuer}</span>}</li>)}</ul>}</div>
      <a className="button button-outline" href={credlyUrl} target="_blank" rel="noopener noreferrer">Open Credly <span aria-hidden="true">↗</span></a>
    </section>
    <p className="credentials-crosslink">See <Link to="/achievements">awards and academic milestones <span aria-hidden="true">↗</span></Link>.</p>
  </main>
}

export { CredentialGrid }

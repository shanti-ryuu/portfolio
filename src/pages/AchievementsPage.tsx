import { Link } from 'react-router-dom'
import { credentials } from '../data/credentials'
import { CredentialGrid } from './CredentialsPage'
import DancingCat from '../components/DancingCat'

const catMedia = `${import.meta.env.BASE_URL}media/cat-dancing/`
const safariCat = typeof navigator !== 'undefined' && /AppleWebKit/i.test(navigator.userAgent) && (/(iPhone|iPad|iPod|Macintosh.*Mobile)/i.test(navigator.userAgent) || !/(Chrome|Chromium|Edg|OPR|Firefox)/i.test(navigator.userAgent))

export default function AchievementsPage() {
  const records = credentials.filter((record) => record.category === 'award' || record.category === 'academic')
  return <main className="page-shell page-achievements">
    <header className="achievement-hero page-intro"><div><span className="eyebrow">ACHIEVEMENTS</span><h1>Milestones, with evidence.</h1><p>Awards and academic recognition, with the certificates and photos behind them.</p></div><DancingCat src={`${catMedia}scuba.${safariCat ? 'mov' : 'webm'}`} poster={`${catMedia}scuba-poster.png`} size={220} className="achievement-hero-cat" /></header>
    <section className="achievements-section" aria-label="Awards and academic milestones">
      <CredentialGrid records={records} category={null} emptyTitle="No milestones are listed yet." />
    </section>
    <p className="credentials-crosslink">See <Link to="/credentials">courses and participation records <span aria-hidden="true">↗</span></Link>.</p>
  </main>
}

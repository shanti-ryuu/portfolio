import { Link } from 'react-router-dom'
import { credentials } from '../data/credentials'
import { CredentialGrid } from './CredentialsPage'

export default function AchievementsPage() {
  const records = credentials.filter((record) => record.category === 'award' || record.category === 'academic')
  return <main className="page-shell page-achievements">
    <header className="page-intro"><span className="eyebrow">ACHIEVEMENTS</span><h1>Milestones, with evidence.</h1><p>Awards and academic recognition, with the certificates and photos behind them.</p></header>
    <section className="achievements-section" aria-label="Awards and academic milestones">
      <CredentialGrid records={records} category={null} emptyTitle="No milestones are listed yet." />
    </section>
    <p className="credentials-crosslink">See <Link to="/credentials">courses and participation records <span aria-hidden="true">↗</span></Link>.</p>
  </main>
}

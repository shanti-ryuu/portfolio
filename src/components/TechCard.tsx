import type { TechItem } from '../data/techStack'
import { Link } from 'react-router-dom'
import TechLogo from './TechLogo'

type ProjectReference = { slug: string; title: string; planned: boolean }

export default function TechCard({ tech, compact = false, projectReferences = [] }: { tech: TechItem; compact?: boolean; projectReferences?: ProjectReference[] }) {
  const statusText = tech.status === 'used' ? 'Used' : tech.status === 'exploring' ? 'Exploring' : 'Studied'
  const visibleProjects = projectReferences.slice(0, 2)
  const remainingProjects = projectReferences.length - visibleProjects.length
  return <article id={tech.id} tabIndex={0} className={`tech-card glass-panel${compact ? ' tech-card-compact' : ''}`}>
    <div className="tech-card-heading"><TechLogo logo={tech.logo} name={tech.name} /><span className={`tech-status-chip status-${tech.status}`}>{statusText}</span></div>
    <h3>{tech.name}</h3><p>{tech.note}</p>
    {tech.todo && <small className="tech-todo">TODO: {tech.todo}</small>}
    {projectReferences.length > 0 && <div className="tech-card-projects"><span>{projectReferences.some((project) => !project.planned) ? 'Used in' : 'Planned for'}</span><div className="tech-card-project-links">{visibleProjects.map((project) => <Link to={`/projects/${project.slug}`} key={project.slug}>{project.title}{project.planned ? ' · planned' : ''}</Link>)}{remainingProjects > 0 && <span className="project-count">+{remainingProjects}</span>}</div></div>}
  </article>
}

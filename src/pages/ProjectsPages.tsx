import { Link, useParams } from 'react-router-dom'
import Gallery from '../components/Gallery'
import TechLogo from '../components/TechLogo'
import { galleries, teamCollab } from '../data/gallery.generated'
import { projects, type Project, type ProjectStatus } from '../data/projects'
import { techStack } from '../data/techStack'

function ProjectTech({ ids, compact = false, linked = false }: { ids: string[]; compact?: boolean; linked?: boolean }) {
  return <ul className={`project-tech-list${compact ? ' project-tech-list-compact' : ''}`}>
    {ids.map((id) => {
      const tech = techStack.find((item) => item.id === id)
      return tech ? <li key={id}>{linked ? <Link to={`/tech-stack#${tech.id}`}><TechLogo logo={tech.logo} name={tech.name} /><span>{tech.name}</span></Link> : <><TechLogo logo={tech.logo} name={tech.name} /><span>{tech.name}</span></>}</li> : null
    })}
  </ul>
}

function ProjectCard({ project, index, featured = false }: { project: Project; index: number; featured?: boolean }) {
  const cover = galleries[project.gallery]?.[0]
  return <article className={`project-card${featured ? ' project-card-featured' : ''}`}>
    <Link className="project-card-link" to={`/projects/${project.slug}`} aria-label={`Read ${project.shortTitle} case study`}>
      <div className="project-cover">
        {cover && <><img className="project-cover-blur" src={`${import.meta.env.BASE_URL}${cover.src}`} alt="" aria-hidden="true" />
          <img className="project-cover-image" src={`${import.meta.env.BASE_URL}${cover.src}`} alt={cover.alt} width={cover.width} height={cover.height} loading="lazy" decoding="async" /></>}
        <span className="project-cover-index" aria-hidden="true">PROJECT / {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="project-card-body">
        <div className="project-meta"><span>{project.kind}</span><span className="status-pill">{project.status}</span></div>
        <h2>{project.shortTitle}</h2>
        <p className="project-summary">{project.summary}</p>
        <div className="project-card-info"><div><span className="project-sub-label">MY ROLE</span><ul className="role-chip-list">{project.roles.map((role) => <li key={role}>{role}</li>)}</ul></div>
          <div><span className="project-sub-label">TECHNOLOGY</span><ProjectTech ids={project.tech} compact /></div></div>
        <span className="project-card-bottom">Read case study <b aria-hidden="true">↗</b></span>
      </div>
    </Link>
    {project.repos.length > 0 && <div className="project-card-repos" aria-label={`${project.shortTitle} repositories`}>{project.repos.map((repo) => <a key={repo.url} href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`${repo.label}, opens GitHub`}><RepositoryIcon /><span>{repo.label}</span><small>opens GitHub ↗</small></a>)}</div>}
  </article>
}

export function ProjectsPage() {
  const featured = projects.find((project) => project.slug === 'grain-solar-rice-dryer')!
  const remaining = projects.filter((project) => project !== featured)
  return <main className="page-shell page-projects">
    <header className="page-intro"><span className="eyebrow">SELECTED WORK</span><h1>Selected work.</h1><p>A set of interfaces and team projects I’ve helped shape.</p></header>
    <section className="project-index" aria-label="Selected projects">
      <div className="project-grid"><ProjectCard project={featured} index={projects.indexOf(featured)} featured />{remaining.map((project) => <ProjectCard key={project.slug} project={project} index={projects.indexOf(project)} />)}</div>
    </section>
    <section className="team-collab-section" aria-labelledby="team-collab-title">
      <div className="section-title"><div><span className="eyebrow">BEHIND THE WORK</span><h2 id="team-collab-title">Team collaboration</h2></div></div>
      <Gallery images={teamCollab} label="Team collaboration" compact emptyMessage="No team collaboration photos are available." />
    </section>
  </main>
}

function RepositoryIcon() {
  return <svg className="external-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M11 3h6v6M17 3l-8 8" /><path d="M15 11v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
}

function StatusTable({ project }: { project: Project }) {
  if (!project.components?.length) return null
  return <section className="detail-block component-status-block"><h2>Component status</h2><div className="component-status-table" role="table" aria-label={`${project.shortTitle} component status`}>
    <div className="component-status-row component-status-head" role="row"><span role="columnheader">Component</span><span role="columnheader">Status</span><span role="columnheader">Repository evidence</span></div>
    {project.components.filter((component) => !component.draft).map((component) => <div className="component-status-row" role="row" key={component.title}><span role="cell">{component.title}</span><span role="cell"><StatusLabel status={component.status} /></span><span role="cell">{component.evidence}</span></div>)}
  </div></section>
}

function StatusLabel({ status }: { status: ProjectStatus }) { return <span className={`component-status-label status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span> }

export function ProjectDetailPage() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)
  if (!project) return <main className="page-shell not-found-page"><header className="page-intro"><span className="eyebrow">PROJECT NOT FOUND</span><h1>This project isn’t here.</h1><p>It may have moved or the address may be incorrect.</p></header><Link className="button button-dark" to="/projects">Back to projects <span aria-hidden="true">↗</span></Link></main>
  const index = projects.indexOf(project)
  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  return <main className="page-shell project-detail-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/projects">Projects</Link><span aria-hidden="true">/</span><span aria-current="page">{project.shortTitle}</span></nav>
    <header className="page-intro"><span className="eyebrow">CASE STUDY / {String(index + 1).padStart(2, '0')}</span><h1>{project.title}</h1><div className="project-meta detail-project-meta"><span>{project.kind}</span><span className="status-pill">{project.status}</span></div><ul className="role-chip-list detail-role-list">{project.roles.map((role) => <li key={role}>{role}</li>)}</ul></header>
    <section className="detail-gallery" aria-label="Project screenshots"><Gallery images={galleries[project.gallery] ?? []} label={`${project.shortTitle} screenshots`} /></section>
    <div className="detail-layout"><aside className="detail-sidebar"><div><span className="project-sub-label">PROJECT TYPE</span><p>{project.kind}</p></div><div><span className="project-sub-label">STATUS</span><p>{project.status}</p></div><div><span className="project-sub-label">MY CONTRIBUTION</span><ul className="editorial-list">{project.roles.map((role) => <li key={role}>{role}</li>)}</ul></div></aside>
      <div className="detail-main">
        <section className="detail-block"><h2>Overview</h2><p>{project.summary}</p></section>
        <section className="detail-block"><h2>Context</h2><p>{project.context}</p></section>
        <section className="detail-block"><h2>My contribution</h2><ul className="editorial-list">{project.contribution.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {project.features.some((item) => !item.draft) && <section className="detail-block"><h2>Features</h2><ul className="detail-facts">{project.features.filter((item) => !item.draft).map((item) => <li key={item.title}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ul></section>}
        {project.architecture.some((item) => !item.draft) && <section className="detail-block"><h2>Architecture</h2><ul className="detail-facts">{project.architecture.filter((item) => !item.draft).map((item) => <li key={item.title}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ul></section>}
        <section className="detail-block"><h2>Technology</h2><ProjectTech ids={project.tech} linked />{project.plannedTech?.length ? <><h3 className="planned-tech-heading">Planned / under development</h3><ProjectTech ids={project.plannedTech} linked /></> : null}</section>
        <section className="detail-block repository-block"><h2>Repositories</h2><ul>{project.repos.map((repo) => { const path = new URL(repo.url).pathname.replace(/^\//, '').replace(/\.git$/, ''); return <li key={repo.url}><a href={repo.url} target="_blank" rel="noopener noreferrer"><span><strong>{repo.label}</strong><small>{path}</small></span><span className="repo-link-affordance">Opens GitHub <RepositoryIcon /></span></a>{repo.note && <p>{repo.note}</p>}</li> })}</ul></section>
        <StatusTable project={project} />
        <section className="detail-block"><h2>Status</h2><p>{project.status}. Repository evidence describes code present in the linked projects; it does not establish live deployment or real-world system performance.</p></section>
      </div></div>
    <nav className="project-pagination" aria-label="Project navigation"><Link to={`/projects/${previous.slug}`}><span className="eyebrow">PREVIOUS</span><strong>{previous.shortTitle}</strong></Link><Link to={`/projects/${next.slug}`}><span className="eyebrow">NEXT</span><strong>{next.shortTitle}</strong></Link></nav>
  </main>
}

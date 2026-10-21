import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import CursorCharacter from './CursorCharacter'
import ParticleBackground from './ParticleBackground'
import PixelCatCompanion from './PixelCatCompanion'
import DancingCat from './components/DancingCat'
import Reveal from './components/Reveal'
import useTypewriter from './useTypewriter'
import { profile } from './data/portfolio'
import { projects } from './data/projects'
import { aboutContent } from './data/about'
import { techStack, type TechCategory, type TechStatus } from './data/techStack'
import TechCard from './components/TechCard'
import { ProjectDetailPage, ProjectsPage } from './pages/ProjectsPages'
import CredentialsPage from './pages/CredentialsPage'
import AchievementsPage from './pages/AchievementsPage'
import './App.css'

const navigation = [
  ['Home', '/'],
  ['About', '/about'],
  ['Tech Stack', '/tech-stack'],
  ['Projects', '/projects'],
  ['Credentials', '/credentials'],
  ['Achievements', '/achievements'],
  ['Contact', '/contact'],
] as const

function Header() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const isCurrentRoute = (path: string) => path === '/projects'
    ? location.pathname === path || location.pathname.startsWith(`${path}/`)
    : location.pathname.replace(/\/$/, '') === path.replace(/\/$/, '')
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(false))
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFirst = () => menuRef.current?.querySelector<HTMLElement>('a')?.focus()
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !menuRef.current) return
      const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a[href]'))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (!menuRef.current.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    const focusTimer = window.setTimeout(focusFirst, 0)
    document.addEventListener('keydown', trapFocus)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', trapFocus)
    }
  }, [open])

  return <>
    <header ref={headerRef} className="site-header">
      <Link className="wordmark" to="/" aria-label={`${profile.name} home`}>{profile.initials}<span>.</span></Link>
      <button ref={toggleRef} className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      <nav className="main-nav desktop-main-nav" aria-label="Main navigation">
        {navigation.map(([label, path]) => <Link key={path} to={path} aria-current={isCurrentRoute(path) ? 'page' : undefined} className={isCurrentRoute(path) ? 'active' : undefined}>{label}</Link>)}
      </nav>
      <Link className="nav-cta desktop-nav-cta" to="/contact">Let’s talk <span aria-hidden="true">↗</span></Link>
    </header>
    <AnimatePresence>
      {open && <>
        <motion.button className="menu-backdrop" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }} />
        <motion.nav ref={menuRef} id="site-navigation" className="main-nav mobile-main-nav" aria-label="Main navigation" initial={{ opacity: 0, y: -8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }} transition={{ duration: .18 }}>
          {navigation.map(([label, path]) => <Link key={path} to={path} onClick={() => setOpen(false)} aria-current={isCurrentRoute(path) ? 'page' : undefined} className={isCurrentRoute(path) ? 'active' : undefined}>{label}</Link>)}
          <Link className="nav-cta mobile-nav-cta" to="/contact" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></Link>
        </motion.nav>
      </>}
    </AnimatePresence>
  </>
}

function Footer() {
  return <footer className="site-footer">
    <div className="site-footer-inner">
      <div className="footer-main"><Link className="wordmark" to="/" aria-label={`${profile.name} home`}>{profile.initials}<span>.</span></Link><div className="footer-identity"><p>IT student · Frontend &amp; IoT</p><span className="footer-location">St. Dominic College of Asia</span></div></div>
      <small>© {new Date().getFullYear()} {profile.name}</small>
    </div>
  </footer>
}

function Eyebrow({ children }: { children: ReactNode }) { return <span className="eyebrow">{children}</span> }

function PageIntro({ label, title, description, children }: { label: string; title: string; description: string; children?: ReactNode }) {
  return <header className="page-intro"><Eyebrow>{label}</Eyebrow><h1>{title}</h1><p>{description}</p>{children}</header>
}

function SectionTitle({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return <div className="section-title"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div>{children}</div>
}

function Hero({ heroRef, copyOpacity, copyY, cueOpacity, reduceMotion, mobileModel }: { heroRef: RefObject<HTMLElement | null>; copyOpacity: MotionValue<number>; copyY: MotionValue<number>; cueOpacity: MotionValue<number>; reduceMotion: boolean; mobileModel: ReactNode }) {
  const typedText = useTypewriter('Aspiring Frontend dev and cybersecurity professional', reduceMotion)
  return <section ref={heroRef} className="hero hero-cinematic" aria-labelledby="home-title">
    <div className="hero-stage" aria-hidden="true"><span className="hero-grain" /></div>
    <div className="hero-inner section-wrap">
      <motion.div className="hero-copy" style={reduceMotion ? { opacity: 1, y: 0 } : { opacity: copyOpacity, y: copyY }}>
        <h1 id="home-title"><span>Hi, I'm Joshua,</span><span>nice to meet you.</span></h1>
        <p className="typing-line" aria-label="Aspiring Frontend dev and cybersecurity professional" aria-live="off">{typedText}{!reduceMotion && <span className="typing-cursor" aria-hidden="true">|</span>}</p>
        <p className="hero-description">I'm a Bachelor of Science in Information Technology student at St. Dominic College of Asia, interested in frontend/UI development, connected systems, AI-assisted projects, and cybersecurity.</p>
        <div className="hero-actions">
          <Link className="button button-dark" to="/projects">Explore projects <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
        </div>
      </motion.div>
      {mobileModel}
      <div className="hero-bottom-bar">
        <motion.a className="scroll-cue" href="#selected-work" style={reduceMotion ? { opacity: 1 } : { opacity: cueOpacity }}><span className="scroll-line" /><span>Scroll to explore</span><span className="scroll-arrow" aria-hidden="true">↓</span></motion.a>
        <span className="hero-corner-bottom">Joshua Santelices – 2026</span>
      </div>
    </div>
  </section>
}

function ModelStage({ wrapRef, progress, reduceMotion, mobile }: { wrapRef: RefObject<HTMLDivElement | null>; progress: MotionValue<number>; reduceMotion: boolean; mobile: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(() => {
    const width = window.innerWidth
    const boxWidth = Math.max(520, Math.min(width * .5, 900))
    return { width, boxWidth, startX: width * .74 - boxWidth / 2, endX: width * .26 - boxWidth / 2 }
  })
  useLayoutEffect(() => {
    const measure = () => {
      const width = window.innerWidth
      const boxWidth = Math.max(520, Math.min(width * .5, 900))
      setPosition({ width, boxWidth, startX: width * .74 - boxWidth / 2, endX: width * .26 - boxWidth / 2 })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.documentElement)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  const desktopX = useTransform(progress, [0, .55], [position.startX, position.endX])
  const desktopScale = useTransform(progress, [0, .55], [1, .97])
  const mobileX = useTransform(progress, [0, 1], [0, -position.width * .14])
  const mobileScale = useTransform(progress, [0, 1], [1, .9])
  const mobileOpacity = useTransform(progress, [.35, 1], [1, 0])
  const activeX = mobile ? mobileX : desktopX
  const activeScale = mobile ? mobileScale : desktopScale
  const x = useTransform(activeX, (value) => reduceMotion ? (mobile ? 0 : position.startX) : value)
  const scale = useTransform(activeScale, (value) => reduceMotion ? 1 : value)
  const opacity = useTransform(mobileOpacity, (value) => reduceMotion || !mobile ? 1 : value)

  return <div ref={stageRef} className={mobile ? 'model-stage mobile-model-stage' : 'model-stage'} aria-hidden="true">
    <motion.div className="model-frame" style={{ x, scale, opacity }}>
      <CursorCharacter interactionRegionRef={wrapRef} playbackRegionRef={stageRef} />
    </motion.div>
  </div>
}

function Projects({ progress, reduceMotion, mobile }: { progress: MotionValue<number>; reduceMotion: boolean; mobile: boolean }) {
  const panelOpacity = useTransform(progress, [.25, .55], [0, 1])
  const panelX = useTransform(progress, [.25, .55], [mobile ? 0 : 60, 0])
  return <section className="selected-work-stage" id="selected-work" aria-labelledby="selected-work-title">
    <motion.div className="selected-work-content" style={reduceMotion ? { opacity: 1, x: 0 } : { opacity: panelOpacity, x: panelX }}>
      <div className="selected-work-heading"><Eyebrow>01 / SELECTED WORK</Eyebrow><h2 id="selected-work-title">What I’m building.</h2><p>Frontend craft, connected devices, and ideas still taking shape.</p></div>
      <div className="selected-work-list">{projects.map((project, index) => <Link className="selected-work-item" to={`/projects/${project.slug}`} key={project.slug}>
        <span className="work-item-index">0{index + 1} <span>·</span> {project.kind} <span>·</span> {project.status}</span>
        <h3>{project.shortTitle}</h3><p>{project.summary}</p>
        <span className="work-technologies">Roles: {project.roles.join(' · ')}<br />{project.tech.map((id) => techStack.find((technology) => technology.id === id)?.name).filter(Boolean).slice(0, 5).join(' · ')}</span><span className="work-item-arrow" aria-hidden="true">↗</span>
      </Link>)}</div>
      <div className="technical-focus"><Eyebrow>TECHNICAL FOCUS</Eyebrow><ul>{['Frontend & UI', 'IoT integration', 'AI-assisted systems'].map((focus) => <li key={focus}>{focus}</li>)}</ul></div>
      <Link className="inline-arrow work-all-link" to="/projects">View all project details <span aria-hidden="true">↗</span></Link>
    </motion.div>
  </section>
}

function HomeScrollScene() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: .6 })
  const copyOpacity = useTransform(progress, [0, .22], [1, 0])
  const copyY = useTransform(progress, [0, .22], [0, -40])
  const cueOpacity = useTransform(progress, [0, .1], [1, 0])
  const mobileModel = mobile ? <ModelStage wrapRef={wrapRef} progress={heroProgress} reduceMotion={reduceMotion} mobile /> : null

  return <div ref={wrapRef} className="home-scroll-scene">
    {!mobile && <ModelStage wrapRef={wrapRef} progress={progress} reduceMotion={reduceMotion} mobile={false} />}
    <Hero heroRef={heroRef} copyOpacity={copyOpacity} copyY={copyY} cueOpacity={cueOpacity} reduceMotion={reduceMotion} mobileModel={mobileModel} />
    <Projects progress={progress} reduceMotion={reduceMotion} mobile={mobile} />
  </div>
}

function Home() {
  return <HomeScrollScene />
}

function AboutPage() {
  const reduceMotion = Boolean(useReducedMotion())
  const featured = techStack.filter((tech) => tech.featured)
  const summaryProjects = projects
  const relatedProjects = (id: string) => projects.flatMap((project) => [
    ...(project.tech.includes(id) ? [{ slug: project.slug, title: project.shortTitle, planned: false }] : []),
    ...(project.plannedTech?.includes(id) ? [{ slug: project.slug, title: project.shortTitle, planned: true }] : []),
  ])
  return <main className="page-shell page-about new-content-page">
    <Reveal className="about-intro-reveal"><section className="about-intro content-container">
      <div className="about-intro-copy"><Eyebrow>ABOUT JOSHUA</Eyebrow><h1>{aboutContent.title}</h1><p>{aboutContent.introduction}</p></div>
      <motion.div className="about-portrait-stage" initial={reduceMotion ? false : { opacity: 0, y: 16, scale: .98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0 : .48, ease: 'easeOut' }}><img className="about-portrait" src={`${import.meta.env.BASE_URL}media/profile-pic.png`} alt="Portrait of Joshua" /></motion.div>
    </section></Reveal>
    <Reveal className="about-section-reveal"><section className="about-section about-background-section content-container"><SectionTitle label="BACKGROUND" title="A student building through projects." /><div className="about-background-grid"><div className="about-copy measure-copy"><p>{aboutContent.background}</p><p>{aboutContent.interests}</p></div><div className="education-details"><Eyebrow>EDUCATION</Eyebrow><h2 className="education-title">Where I’m learning.</h2><article className="education-card glass-panel"><span className="education-mark" aria-hidden="true">SD</span><div><h3>{profile.education.degree}</h3><p>{profile.education.institution}</p><span className="muted-note">{profile.education.yearLevel || 'Year level: update when confirmed'}</span></div></article></div></div></section></Reveal>
    <Reveal className="about-section-reveal"><section className="about-section content-container"><SectionTitle label="APPROACH & CURRENT LEARNING" title="Curious about the whole system." /><div className="about-copy measure-copy"><p>{aboutContent.approach}</p><ul className="about-learning-list">{aboutContent.learningGoals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div></section></Reveal>
    <Reveal className="about-section-reveal"><section className="about-section content-container"><SectionTitle label="PROJECT HIGHLIGHTS" title="Learning by making." /><div className="about-project-list">{summaryProjects.map((project, index) => <Link className="about-project glass-panel" to={`/projects/${project.slug}`} key={project.slug}><span className="about-project-index">0{index + 1} · {project.status}</span><h3>{project.shortTitle}</h3><p>{project.summary}</p><span className="about-project-roles">My role · {project.roles.join(' · ')}</span><span className="about-project-link">Project details <span aria-hidden="true">↗</span></span></Link>)}</div></section></Reveal>
    <Reveal className="about-section-reveal"><section className="about-section content-container about-tech-section"><SectionTitle label="SELECTED TECHNOLOGIES" title="Tools I’m working with." /><div className="tech-card-grid about-featured-grid">{featured.map((tech) => <TechCard tech={tech} key={tech.id} compact projectReferences={relatedProjects(tech.id)} />)}</div><Link className="inline-arrow" to="/tech-stack">See the full stack <span aria-hidden="true">↗</span></Link></section></Reveal>
  </main>
}

function TechStackPage() {
  const [category, setCategory] = useState<TechCategory | 'All'>('All')
  const [status, setStatus] = useState<TechStatus | 'All'>('All')
  const reduceMotion = Boolean(useReducedMotion())
  const categories: Array<TechCategory | 'All'> = ['All', 'Frontend', 'Programming', 'Mobile', 'Backend & Data', 'Cloud & Tools']
  const categoryCount = (item: TechCategory | 'All') => item === 'All' ? techStack.length : techStack.filter((tech) => tech.category === item).length
  const filtered = techStack.filter((tech) => (category === 'All' || tech.category === category) && (status === 'All' || tech.status === status))
  const relatedProjects = (id: string) => projects.flatMap((project) => [
    ...(project.tech.includes(id) ? [{ slug: project.slug, title: project.shortTitle, planned: false }] : []),
    ...(project.plannedTech?.includes(id) ? [{ slug: project.slug, title: project.shortTitle, planned: true }] : []),
  ])
  return <main className="page-shell page-tech-stack new-content-page">
    <header className="tech-page-intro content-container"><Eyebrow>TECH STACK</Eyebrow><h1>Tools, technologies, and learning in progress.</h1><p>A practical snapshot of the tools used in my portfolio and project work, alongside areas I’m currently exploring.</p></header>
    <section className="tech-stack-section content-container" aria-label="Technology inventory">
      <div className="tech-filter-row" aria-label="Filter by category">{categories.map((item) => <button type="button" className={`tech-filter${category === item ? ' is-selected' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)} ref={(node) => { if (node && category === item) node.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }) }} key={item}>{item}<span>{categoryCount(item)}</span></button>)}</div>
      <div className="tech-status-row" aria-label="Filter by status">{(['All', 'used', 'studied', 'exploring'] as const).map((item) => <button type="button" className={`status-filter${status === item ? ' is-selected' : ''}`} aria-pressed={status === item} onClick={() => setStatus(item)} ref={(node) => { if (node && status === item) node.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }) }} key={item}>{item === 'All' ? 'All statuses' : item}</button>)}</div>
      {filtered.length ? <motion.div className="tech-card-grid" layout={!reduceMotion} transition={{ duration: reduceMotion ? 0 : .22, ease: 'easeOut' }}><AnimatePresence initial={false} mode="popLayout">{filtered.map((tech) => <TechCard tech={tech} key={tech.id} projectReferences={relatedProjects(tech.id)} />)}</AnimatePresence></motion.div> : <div className="tech-empty glass-panel"><h2>No technologies match those filters.</h2><p>Choose another category or status to see more of the stack.</p></div>}
      <p className="tech-stack-note">This stack reflects ongoing learning, not a proficiency ranking.</p>
    </section>
  </main>
}

function ContactPage() {
  const hasEmail = Boolean(profile.email.trim())
  const socials = [['GitHub', profile.githubUrl], ['LinkedIn', profile.linkedInUrl]].filter((item): item is [string, string] => Boolean(item[1]))
  return <main className="page-shell page-contact"><PageIntro label="CONTACT" title="Good work starts with a conversation." description="I’m open to connecting about university projects, internship opportunities, and thoughtful technology." />
    <Reveal><section className="contact-panel content-section"><div><Eyebrow>GET IN TOUCH</Eyebrow><h2>Say hello.</h2><p>{hasEmail ? 'Use the email link to reach me.' : 'My verified email address has not been added yet, so there is no direct contact link at this time.'}</p></div><div className="contact-methods">{hasEmail ? <a className="button button-dark" href={`mailto:${profile.email}`}>Email Joshua <span aria-hidden="true">↗</span></a> : <p className="contact-placeholder">Email: add a verified address in <code>profile.email</code> in <code>src/data/portfolio.ts</code>.</p>}{socials.map(([label, url]) => <a className="contact-social" key={label} href={url} target="_blank" rel="noreferrer"><SocialIcon label={label} />{label}<span aria-hidden="true">↗</span></a>)}{!socials.length && <p className="muted-note">Verified social profile links have not been supplied.</p>}</div></section></Reveal>
    <div className="contact-next"><Link className="inline-arrow" to="/projects">Explore selected projects <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/">Return home <span aria-hidden="true">↗</span></Link></div>
  </main>
}

function SocialIcon({ label }: { label: string }) {
  return label === 'GitHub' ? <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.48-.28-5.1-1.24-5.1-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.43.11-2.98 0 0 .94-.3 3.06 1.15a10.64 10.64 0 0 1 5.57 0c2.12-1.45 3.06-1.15 3.06-1.15.61 1.55.23 2.7.11 2.98.72.78 1.15 1.78 1.15 3 0 4.29-2.62 5.23-5.12 5.51.4.35.75 1.02.75 2.06v3.07c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg> : <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.68H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.48v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V8.99h3.56v11.46ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.44c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
}

function NotFoundPage() {
  return <main className="page-shell not-found-page"><PageIntro label="404 / NOT FOUND" title="This page isn’t here." description="The address may have changed, or the page may still be in progress." /><Link className="button button-dark" to="/">Return home <span aria-hidden="true">↗</span></Link></main>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname])
  return null
}

function RouteDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Joshua Carlo M. Santelices · Portfolio',
      '/about': 'About · Joshua Carlo M. Santelices',
      '/tech-stack': 'Tech Stack · Joshua Carlo M. Santelices',
      '/projects': 'Projects · Joshua Carlo M. Santelices',
      '/credentials': 'Credentials · Joshua Carlo M. Santelices',
      '/certifications': 'Credentials · Joshua Carlo M. Santelices',
      '/achievements': 'Achievements · Joshua Carlo M. Santelices',
      '/contact': 'Contact · Joshua Carlo M. Santelices',
    }
    const projectSlug = pathname.startsWith('/projects/') ? decodeURIComponent(pathname.split('/').at(-1) ?? '') : ''
    const project = projects.find((item) => item.slug === projectSlug)
    document.title = titles[pathname] ?? (project ? `${project.title} · Joshua Carlo M. Santelices` : pathname.startsWith('/projects/') ? 'Project · Joshua Carlo M. Santelices' : 'Page not found · Joshua Carlo M. Santelices')
  }, [pathname])
  return null
}

function DancingCatBackground() {
  const { pathname } = useLocation()
  const route = pathname === '/' ? 'home' : pathname.startsWith('/projects') ? 'projects' : pathname.slice(1).split('/')[0] || 'home'
  const media = `${import.meta.env.BASE_URL}media/cat-dancing/optimized/`
  const contact = route === 'contact'
  return <div className="dancing-cat-layer" data-route={route} aria-hidden="true">
    <DancingCat key="left-companion" src={`${media}${contact ? 'damdamdidi' : 'scuba'}.mp4`} poster={`${media}${contact ? 'damdamdidi' : 'scuba'}-poster.png`} side="left" size={contact ? 170 : route === 'about' ? 190 : 166} />
    <DancingCat key="right-companion" src={`${media}${contact ? 'thankyou' : 'damdamdidi'}.mp4`} poster={`${media}${contact ? 'thankyou' : 'damdamdidi'}-poster.png`} side={contact ? 'center' : 'right'} size={contact ? 190 : route === 'tech-stack' || route === 'achievements' ? 220 : route === 'about' ? 190 : 176} />
  </div>
}

function App() {
  const location = useLocation()
  const reducedMotion = Boolean(useReducedMotion())
  return <div className="app-shell"><ParticleBackground /><PixelCatCompanion /><DancingCatBackground /><Header /><div className="route-content"><AnimatePresence mode="wait" initial={false}><motion.div key={location.pathname} className="route-transition" initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reducedMotion ? 0 : .18, ease: 'easeOut' }}><Routes location={location}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/tech-stack" element={<TechStackPage />} />
    <Route path="/tech-stack.html" element={<Navigate to="/tech-stack" replace />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/projects/:slug" element={<ProjectDetailPage />} />
    <Route path="/credentials" element={<CredentialsPage />} />
    <Route path="/certifications" element={<Navigate to="/credentials" replace />} />
    <Route path="/achievements" element={<AchievementsPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></motion.div></AnimatePresence></div><Footer /></div>
}

function PortfolioApp() {
  return <BrowserRouter basename={import.meta.env.BASE_URL}><ScrollToTop /><RouteDocumentTitle /><App /></BrowserRouter>
}

export default PortfolioApp

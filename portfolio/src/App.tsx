import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { VideoGrid } from './components/VideoGrid.tsx'
import { DitherBackground } from './components/DitherBackground.tsx'
import { type VideoRole, type VideoMeta } from './data/videos.ts'
import { getRoles, getProjects, getAboutMeImage, getInitialStateSync } from './services/api.ts'

// Estado inicial síncrono: lê do cache local imediatamente, sem esperar a API.
// Garante que o conteúdo apareça na hora mesmo que a API demore para acordar.
const _initial = getInitialStateSync()

function App() {
  const [projects, setProjects] = useState<VideoMeta[]>(_initial.projects)
  const [aboutMeImage, setAboutMeImage] = useState<string>(_initial.aboutMeImage)
  const [availableRoles, setAvailableRoles] = useState<string[]>(_initial.roles)

  useEffect(() => {
    // Atualiza silenciosamente com os dados do backend (pode demorar no cold start)
    Promise.all([getProjects(), getRoles(), getAboutMeImage()])
      .then(([projectsData, rolesData, aboutImage]) => {
        setProjects(projectsData)
        setAvailableRoles(rolesData)
        setAboutMeImage(aboutImage)
      })
      .catch(() => {
        // se a API falhar, mantém o que já está sendo exibido (cache local)
      })
  }, [])

  const allRoles = useMemo<VideoRole[]>(() => {
    const roleSet = new Set<VideoRole>()
    projects.forEach((video) => {
      video.roles.forEach((role) => roleSet.add(role))
    })
    // Usa os roles configurados no admin, mas só os que existem nos vídeos
    return availableRoles.filter((role) => roleSet.has(role as VideoRole)) as VideoRole[]
  }, [availableRoles, projects])
  
  const [activeRole, setActiveRole] = useState<VideoRole | 'All'>('All')
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const filteredVideos = useMemo(() => {
    if (activeRole === 'All') return projects
    return projects.filter((video) => video.roles.includes(activeRole))
  }, [activeRole, projects])

  const activeVideo = activeVideoId
    ? projects.find((video) => video.id === activeVideoId) ?? null
    : null

  useEffect(() => {
    if (!activeVideo) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveVideoId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeVideo])

  const closeModal = () => setActiveVideoId(null)

  return (
    <div className={`app-shell ${activeVideo ? 'is-modal-open' : ''}`}>
      <DitherBackground />
      <header id="header" className="header-section">
        <div className="header-section__content">
          <button
            type="button"
            className="header__logo"
            onClick={() => {
              document.getElementById('header')?.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label="Scroll to top"
          >
            <img 
              src="/fonts/arquivos_site_cachoeira/favicon_1.png" 
              alt="Vitor Cachoeira Logo" 
            />
          </button>
          <div className="hero__titles">
            <p className="hero__subtitle">multimedia artist, filmmaker</p>
            <h1 className="hero__heading">
              <span className="hero__heading-line1">Vitor</span>
              <span className="hero__heading-line2">Cachoeira</span>
              <span className="hero__heading-blink">_</span>
            </h1>
            <nav className="hero__navigation">
              <a 
                href="#my-works" 
                className="hero__nav-link"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('my-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                My Works
              </a>
              <a 
                href="#about-me" 
                className="hero__nav-link"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('about-me')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                About Me
              </a>
            </nav>
          </div>
        </div>
      </header>

      <section id="my-works" className="my-works-section">
        <div className="my-works-section__content">
          <h2 className="my-works-section__title">MY WORKS</h2>
          <nav className="my-works-section__filters" aria-label="Filter by role" role="tablist">
            <button
              className={activeRole === 'All' ? 'is-active' : ''}
              onClick={() => setActiveRole('All')}
              role="tab"
              aria-selected={activeRole === 'All'}
            >
              <span>All</span>
            </button>
            {allRoles.map((role) => (
              <button
                key={role}
                className={activeRole === role ? 'is-active' : ''}
                onClick={() => setActiveRole(role)}
                role="tab"
                aria-selected={activeRole === role}
              >
                <span>{role}</span>
              </button>
            ))}
          </nav>
          <VideoGrid videos={filteredVideos} onSelectVideo={setActiveVideoId} />
        </div>
      </section>

      <section id="about-me" className="about-section">
        <div className="about-section__content">
          <div className="about-section__layout">
            <div className="about-section__image">
              <img 
                src={aboutMeImage} 
                alt="Vitor Cachoeira" 
                className="about-section__image-img"
              />
            </div>
            <div className="about-section__text">
              <h2 className="about-section__title">ABOUT ME</h2>
              <div className="about-section__description">
                <p>
                  Vitor Cachoeira is a 25-year-old multimedia artist and filmmaker based in São Paulo, Brazil. A versatile generalist, he has built experience across a wide range of audiovisual fields, from filmmaking and music videos to live broadcast operations, working with switchers and live production workflows for major companies including YouTube, Paramount+, and Prime Video at CazeTV/Livemode.
                </p>
                <p>
                  In cinema, Vitor works across multiple roles, with experience in directing, cinematography, editing, and color grading. His films have been featured at notable festivals such as Kinoforum, Sinédoque, Festival de Arapiraca, and Metro - Festival de Cinema Universitário, among others.
                </p>
                <p>
                  Currently, he also works at the intersection of music and visual arts, creating imagery and projections for projects like Kabeça Cheia and Monch Monch, while collaborating with friends on initiatives such as Sagrados Anônimos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div>
            <span>Based in São Paulo • Working worldwide</span>
          </div>
          <div className="footer__social">
            <a 
              href="https://www.instagram.com/vitor.cachoeira/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer__social-link"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a 
              href="https://vimeo.com/user113932858" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer__social-link"
              aria-label="Vimeo"
            >
              <i className="bi bi-vimeo"></i>
            </a>
            <a 
              href="https://www.youtube.com/@vitorcachoeira22" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer__social-link"
              aria-label="YouTube"
            >
              <i className="bi bi-youtube"></i>
            </a>
          </div>
          <a href="mailto:vitorcacchoeira@gmail.com">vitorcacchoeira@gmail.com</a>
          <button
            type="button"
            className="footer__logo"
            onClick={() => {
              document.getElementById('header')?.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label="Return to top"
          >
            <img 
              src="/fonts/arquivos_site_cachoeira/favicon_1.png" 
              alt="Vitor Cachoeira Logo" 
            />
          </button>
        </footer>
      </section>

      {activeVideo ? (
        <div className="video-modal" role="dialog" aria-modal="true">
          <div className="video-modal__backdrop" onClick={closeModal} />
          <div className="video-modal__content">
            <button
              type="button"
              className="video-modal__close"
              onClick={closeModal}
              aria-label="Close video"
            >
              ×
            </button>
            <iframe
              src={activeVideo.embedUrl}
              title={activeVideo.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App

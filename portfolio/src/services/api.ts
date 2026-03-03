// Camada de API integrada com backend opcional (Neon Postgres via Render).
// Faz UMA única chamada ao backend por carregamento de página (cache em memória),
// evitando race conditions e flashes de conteúdo desatualizado.

import type { VideoMeta, VideoRole } from '../data/videos'
import { videos } from '../data/videos'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

const DEFAULT_ROLES: VideoRole[] = ['DIRECTOR', 'CINEMATOGRAPHER', 'EDITOR', 'COLORIST', 'SOUNDTRACK']
const DEFAULT_ABOUT_ME_IMAGE =
  'https://pub-76ffd52f8d4541deba0aac1dbba56bf2.r2.dev/2fofo-nova_insta.jpg.jpeg'

type SiteState = {
  projects: VideoMeta[]
  roles: string[]
  aboutMeImage: string
}

const DEFAULT_STATE: SiteState = {
  projects: videos,
  roles: DEFAULT_ROLES,
  aboutMeImage: DEFAULT_ABOUT_ME_IMAGE,
}

const STORAGE_KEYS = {
  projects: 'admin_projects',
  roles: 'admin_roles',
  aboutMeImage: 'admin_about_me_image',
}

// ----------------------
// Auth (client-side)
// ----------------------

export const login = async (password: string): Promise<boolean> => {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('admin_authenticated', 'true')
    localStorage.setItem('admin_session', Date.now().toString())
    return true
  }
  return false
}

export const logout = (): void => {
  localStorage.removeItem('admin_authenticated')
  localStorage.removeItem('admin_session')
}

export const isAuthenticated = (): boolean => {
  const authenticated = localStorage.getItem('admin_authenticated')
  const session = localStorage.getItem('admin_session')

  if (!authenticated || !session) return false

  const sessionTime = parseInt(session, 10)
  const now = Date.now()
  if (Number.isNaN(sessionTime) || now - sessionTime > 24 * 60 * 60 * 1000) {
    logout()
    return false
  }

  return true
}

// ----------------------
// Cache em memória — UMA chamada à API por sessão de página
// ----------------------

let _stateCache: SiteState | null = null
let _stateCachePromise: Promise<SiteState> | null = null

const saveStateToLocalStorage = (state: SiteState): void => {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects))
  localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(state.roles))
  localStorage.setItem(STORAGE_KEYS.aboutMeImage, state.aboutMeImage)
}

const loadStateFromLocalStorage = (): SiteState => {
  try {
    const projectsRaw = localStorage.getItem(STORAGE_KEYS.projects)
    const rolesRaw = localStorage.getItem(STORAGE_KEYS.roles)
    const aboutMeRaw = localStorage.getItem(STORAGE_KEYS.aboutMeImage)

    // Só usa localStorage se API_BASE_URL NÃO estiver configurado.
    // Com API, sempre confia no servidor; localStorage é só write-through.
    if (API_BASE_URL) {
      return DEFAULT_STATE
    }

    const projects = projectsRaw ? (JSON.parse(projectsRaw) as VideoMeta[]) : DEFAULT_STATE.projects
    const roles = rolesRaw ? (JSON.parse(rolesRaw) as string[]) : DEFAULT_STATE.roles
    const aboutMeImage = aboutMeRaw || DEFAULT_STATE.aboutMeImage

    return { projects, roles, aboutMeImage }
  } catch {
    return DEFAULT_STATE
  }
}

const fetchStateFromApi = async (): Promise<SiteState> => {
  const res = await fetch(`${API_BASE_URL}/state`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = (await res.json()) as Partial<SiteState>

  return {
    // Respeita array vazio se o usuário apagou tudo — não usa DEFAULT como fallback de array vazio
    projects: Array.isArray(data.projects) ? data.projects : DEFAULT_STATE.projects,
    roles: Array.isArray(data.roles) && data.roles.length > 0 ? data.roles : DEFAULT_STATE.roles,
    aboutMeImage: data.aboutMeImage || DEFAULT_STATE.aboutMeImage,
  }
}

const saveStateToApi = async (state: SiteState): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': ADMIN_PASSWORD,
    },
    body: JSON.stringify(state),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `API error: ${res.status}`)
  }
}

const loadState = (): Promise<SiteState> => {
  // Se já tem cache em memória, devolve imediatamente
  if (_stateCache) return Promise.resolve(_stateCache)

  // Se já tem uma promise em andamento, reutiliza (evita chamadas duplicadas)
  if (_stateCachePromise) return _stateCachePromise

  _stateCachePromise = (async () => {
    if (API_BASE_URL) {
      try {
        const state = await fetchStateFromApi()
        saveStateToLocalStorage(state)
        _stateCache = state
        return state
      } catch (err) {
        console.warn('[api] Falha ao carregar do backend, usando fallback.', err)
        const fallback = loadStateFromLocalStorage()
        _stateCache = fallback
        return fallback
      }
    }

    const state = loadStateFromLocalStorage()
    _stateCache = state
    return state
  })()

  return _stateCachePromise
}

const saveState = async (nextState: SiteState): Promise<void> => {
  // Atualiza cache imediatamente para o admin não "regredir" para estado antigo
  _stateCache = nextState
  _stateCachePromise = null

  saveStateToLocalStorage(nextState)

  if (API_BASE_URL) {
    await saveStateToApi(nextState)
  }
}

// ----------------------
// APIs consumidas pelo app
// ----------------------

export const getProjects = async (): Promise<VideoMeta[]> => {
  const state = await loadState()
  return state.projects
}

export const saveProjects = async (projects: VideoMeta[]): Promise<void> => {
  const state = await loadState()
  await saveState({ ...state, projects })
}

export const updateProject = async (id: string, updates: Partial<VideoMeta>): Promise<VideoMeta> => {
  const state = await loadState()
  const index = state.projects.findIndex((p) => p.id === id)

  if (index === -1) throw new Error('Project not found')

  const updatedProject = { ...state.projects[index], ...updates }
  const projects = [...state.projects]
  projects[index] = updatedProject

  await saveState({ ...state, projects })
  return updatedProject
}

export const addProject = async (project: VideoMeta): Promise<VideoMeta> => {
  const state = await loadState()
  await saveState({ ...state, projects: [...state.projects, project] })
  return project
}

export const deleteProject = async (id: string): Promise<void> => {
  const state = await loadState()
  await saveState({ ...state, projects: state.projects.filter((p) => p.id !== id) })
}

export const getAboutMeImage = async (): Promise<string> => {
  const state = await loadState()
  return state.aboutMeImage
}

export const updateAboutMeImage = async (imageUrl: string): Promise<void> => {
  const state = await loadState()
  await saveState({ ...state, aboutMeImage: imageUrl })
}

export const getRoles = async (): Promise<string[]> => {
  const state = await loadState()
  return state.roles
}

export const saveRoles = async (roles: string[]): Promise<void> => {
  const state = await loadState()
  await saveState({ ...state, roles })
}

export const addRole = async (role: string): Promise<void> => {
  const roles = await getRoles()
  const normalizedRole = role.toUpperCase().trim()

  if (!normalizedRole) throw new Error('Role cannot be empty')
  if (roles.includes(normalizedRole)) throw new Error('Role already exists')

  await saveRoles([...roles, normalizedRole])
}

export const deleteRole = async (role: string): Promise<void> => {
  const roles = await getRoles()
  const filtered = roles.filter((r) => r !== role)

  if (filtered.length === roles.length) throw new Error('Role not found')

  await saveRoles(filtered)
}

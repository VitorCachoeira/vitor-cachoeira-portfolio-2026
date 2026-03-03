// Camada de API que integra o painel admin com um backend opcional.
// Se VITE_API_BASE_URL NÃO estiver definido, tudo continua funcionando só com localStorage (comportamento atual),
// mas quando for definido, o estado passa a ser salvo e lido de um backend (multi-dispositivo).

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
// Helpers de estado (localStorage + backend opcional)
// ----------------------

const loadStateFromLocalStorage = async (): Promise<SiteState> => {
  try {
    const projectsRaw = localStorage.getItem(STORAGE_KEYS.projects)
    const rolesRaw = localStorage.getItem(STORAGE_KEYS.roles)
    const aboutMeRaw = localStorage.getItem(STORAGE_KEYS.aboutMeImage)

    const projects = projectsRaw ? (JSON.parse(projectsRaw) as VideoMeta[]) : DEFAULT_STATE.projects
    const roles = rolesRaw ? (JSON.parse(rolesRaw) as string[]) : DEFAULT_STATE.roles
    const aboutMeImage = aboutMeRaw || DEFAULT_STATE.aboutMeImage

    return { projects, roles, aboutMeImage }
  } catch {
    return DEFAULT_STATE
  }
}

const saveStateToLocalStorage = (state: SiteState): void => {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects))
  localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(state.roles))
  localStorage.setItem(STORAGE_KEYS.aboutMeImage, state.aboutMeImage)
}

const loadStateFromApi = async (): Promise<SiteState> => {
  if (!API_BASE_URL) {
    return DEFAULT_STATE
  }

  const res = await fetch(`${API_BASE_URL}/state`)
  if (!res.ok) {
    throw new Error('Failed to load state from API')
  }
  const data = (await res.json()) as Partial<SiteState>

  return {
    projects: data.projects && data.projects.length > 0 ? data.projects : DEFAULT_STATE.projects,
    roles: data.roles && data.roles.length > 0 ? data.roles : DEFAULT_STATE.roles,
    aboutMeImage: data.aboutMeImage || DEFAULT_STATE.aboutMeImage,
  }
}

const saveStateToApi = async (state: SiteState): Promise<void> => {
  if (!API_BASE_URL) {
    return
  }

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
    throw new Error(text || 'Failed to save state to API')
  }
}

const loadState = async (): Promise<SiteState> => {
  if (API_BASE_URL) {
    try {
      const state = await loadStateFromApi()
      // também espelha no localStorage para ter cache offline
      saveStateToLocalStorage(state)
      return state
    } catch {
      // se a API falhar, tenta localStorage e depois defaults
      return loadStateFromLocalStorage()
    }
  }

  return loadStateFromLocalStorage()
}

const saveState = async (state: SiteState): Promise<void> => {
  saveStateToLocalStorage(state)
  if (API_BASE_URL) {
    await saveStateToApi(state)
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

  if (index === -1) {
    throw new Error('Project not found')
  }

  const updatedProject = { ...state.projects[index], ...updates }
  const projects = [...state.projects]
  projects[index] = updatedProject

  await saveState({ ...state, projects })
  return updatedProject
}

export const addProject = async (project: VideoMeta): Promise<VideoMeta> => {
  const state = await loadState()
  const projects = [...state.projects, project]
  await saveState({ ...state, projects })
  return project
}

export const deleteProject = async (id: string): Promise<void> => {
  const state = await loadState()
  const projects = state.projects.filter((p) => p.id !== id)
  await saveState({ ...state, projects })
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
  
  if (!normalizedRole) {
    throw new Error('Role cannot be empty')
  }
  
  if (roles.includes(normalizedRole)) {
    throw new Error('Role already exists')
  }
  
  await saveRoles([...roles, normalizedRole])
}

export const deleteRole = async (role: string): Promise<void> => {
  const roles = await getRoles()
  const filtered = roles.filter((r) => r !== role)
  
  if (filtered.length === roles.length) {
    throw new Error('Role not found')
  }
  
  await saveRoles(filtered)
}


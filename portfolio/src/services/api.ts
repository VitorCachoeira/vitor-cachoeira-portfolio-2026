// API Service Layer - Ready for backend integration
// For now, uses localStorage. Replace with actual API calls when deploying to proper host.

import type { VideoMeta } from '../data/videos'

// API_BASE_URL will be used when backend is integrated
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Authentication
export const login = async (password: string): Promise<boolean> => {
  // For development: simple password check
  // In production, replace with actual API call
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
  
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
  
  // Session expires after 24 hours
  const sessionTime = parseInt(session, 10)
  const now = Date.now()
  if (now - sessionTime > 24 * 60 * 60 * 1000) {
    logout()
    return false
  }
  
  return true
}

// Projects API
export const getProjects = async (): Promise<VideoMeta[]> => {
  // For now, return from localStorage or default data
  const stored = localStorage.getItem('admin_projects')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // If stored data is invalid, fall back to default
    }
  }
  
  // Return default videos from data file
  const { videos } = await import('../data/videos')
  return videos
}

export const saveProjects = async (projects: VideoMeta[]): Promise<void> => {
  // For now, save to localStorage
  // In production, replace with: POST /api/projects
  localStorage.setItem('admin_projects', JSON.stringify(projects))
  
  // In production, uncomment:
  // await fetch(`${API_BASE_URL}/projects`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(projects)
  // })
}

export const updateProject = async (id: string, updates: Partial<VideoMeta>): Promise<VideoMeta> => {
  const projects = await getProjects()
  const index = projects.findIndex(p => p.id === id)
  
  if (index === -1) {
    throw new Error('Project not found')
  }
  
  projects[index] = { ...projects[index], ...updates }
  await saveProjects(projects)
  return projects[index]
}

export const addProject = async (project: VideoMeta): Promise<VideoMeta> => {
  const projects = await getProjects()
  projects.push(project)
  await saveProjects(projects)
  return project
}

export const deleteProject = async (id: string): Promise<void> => {
  const projects = await getProjects()
  const filtered = projects.filter(p => p.id !== id)
  await saveProjects(filtered)
}

// About Me Image API
export const getAboutMeImage = async (): Promise<string> => {
  const stored = localStorage.getItem('admin_about_me_image')
  if (stored) {
    return stored
  }
  // Default image URL
  return 'https://pub-76ffd52f8d4541deba0aac1dbba56bf2.r2.dev/2fofo-nova_insta.jpg.jpeg'
}

export const updateAboutMeImage = async (imageUrl: string): Promise<void> => {
  // For now, save to localStorage
  // In production, replace with: POST /api/about-me-image
  localStorage.setItem('admin_about_me_image', imageUrl)
  
  // In production, uncomment:
  // await fetch(`${API_BASE_URL}/about-me-image`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ imageUrl })
  // })
}

// Roles/Filters API
export const getRoles = async (): Promise<string[]> => {
  const stored = localStorage.getItem('admin_roles')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // If stored data is invalid, fall back to default
    }
  }
  
  // Default roles
  return ['DIRECTOR', 'CINEMATOGRAPHER', 'EDITOR', 'COLORIST', 'SOUNDTRACK']
}

export const saveRoles = async (roles: string[]): Promise<void> => {
  localStorage.setItem('admin_roles', JSON.stringify(roles))
  
  // In production, replace with: POST /api/roles
  // await fetch(`${API_BASE_URL}/roles`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(roles)
  // })
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
  
  roles.push(normalizedRole)
  await saveRoles(roles)
}

export const deleteRole = async (role: string): Promise<void> => {
  const roles = await getRoles()
  const filtered = roles.filter(r => r !== role)
  
  if (filtered.length === roles.length) {
    throw new Error('Role not found')
  }
  
  await saveRoles(filtered)
}


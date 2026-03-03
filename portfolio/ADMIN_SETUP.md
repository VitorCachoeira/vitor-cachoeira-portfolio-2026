# Admin Panel Setup Guide

## Overview

The admin panel allows you to manage projects and the About Me image through a web interface accessible at `/admin`.

## Current Implementation

Currently, the admin panel uses **localStorage** for data persistence. This works for development and testing, but for production, you'll need to set up a proper backend API.

## Environment Variables

Create a `.env` file in the portfolio directory with:

```
VITE_ADMIN_PASSWORD=your_secure_password_here
VITE_API_BASE_URL=http://localhost:3000/api
```

For production, set:
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Backend API Requirements

When deploying to a proper host, implement the following API endpoints:

### Authentication
- **POST** `/api/auth/login`
  - Body: `{ password: string }`
  - Returns: `{ success: boolean, token?: string }`

### Projects
- **GET** `/api/projects`
  - Returns: `VideoMeta[]`

- **POST** `/api/projects`
  - Body: `VideoMeta[]`
  - Saves all projects

- **PUT** `/api/projects/:id`
  - Body: `Partial<VideoMeta>`
  - Updates a specific project

- **DELETE** `/api/projects/:id`
  - Deletes a specific project

### About Me Image
- **GET** `/api/about-me-image`
  - Returns: `{ imageUrl: string }`

- **POST** `/api/about-me-image`
  - Body: `{ imageUrl: string }`
  - Updates the About Me image URL

## Updating API Service

To connect to your backend, update `src/services/api.ts`:

1. Replace localStorage calls with `fetch()` API calls
2. Add authentication token handling
3. Add proper error handling
4. Update the `API_BASE_URL` to point to your backend

Example:
```typescript
export const getProjects = async (): Promise<VideoMeta[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  })
  if (!response.ok) throw new Error('Failed to fetch projects')
  return response.json()
}
```

## Features

- **Login**: Password-protected access
- **Project Management**: 
  - View all projects
  - Edit project details (title, platform, video ID, year, roles)
  - Add new projects
  - Delete projects
- **About Me Image**: Update the profile image URL

## Security Notes

- Change the default password in production
- Implement proper authentication (JWT tokens, sessions, etc.)
- Add rate limiting to prevent brute force attacks
- Use HTTPS in production
- Validate and sanitize all inputs on the backend


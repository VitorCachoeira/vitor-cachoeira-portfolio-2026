import { useState } from 'react'
import type { FormEvent } from 'react'
import { login } from '../services/api'
import './AdminLogin.css'

type NavigateFunction = (path: string) => void

export function AdminLogin({ navigate }: { navigate?: NavigateFunction }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleNavigate = navigate || ((path: string) => {
    window.location.href = path
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(password)
      if (success) {
        handleNavigate('/admin/dashboard')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <h1 className="admin-login__title">Admin Login</h1>
        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="admin-login__field">
            <label htmlFor="password" className="admin-login__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login__input"
              required
              autoFocus
            />
          </div>
          {error && <div className="admin-login__error">{error}</div>}
          <button
            type="submit"
            className="admin-login__button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}


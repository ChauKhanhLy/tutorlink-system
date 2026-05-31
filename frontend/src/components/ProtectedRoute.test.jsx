import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

function renderProtectedRoute({ user, requiredRole, initialPath = '/private' }) {
  useAuth.mockReturnValue({ user })

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Private page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/admin/login" element={<div>Admin login page</div>} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirects guests to login', () => {
    renderProtectedRoute({ user: null })

    expect(screen.getByText('Login page')).toBeTruthy()
  })

  it('renders children when user is authenticated', () => {
    renderProtectedRoute({
      user: { id: 1, email: 'learner@example.com', role: 'learner' },
    })

    expect(screen.getByText('Private page')).toBeTruthy()
  })

  it('redirects non-admin users away from admin routes', () => {
    renderProtectedRoute({
      user: { id: 1, email: 'learner@example.com', role: 'learner' },
      requiredRole: 'admin',
    })

    expect(screen.getByText('Admin login page')).toBeTruthy()
  })

  it('redirects users with the wrong non-admin role to dashboard', () => {
    renderProtectedRoute({
      user: { id: 2, email: 'tutor@example.com', role: 'tutor' },
      requiredRole: 'learner',
    })

    expect(screen.getByText('Dashboard page')).toBeTruthy()
  })
})

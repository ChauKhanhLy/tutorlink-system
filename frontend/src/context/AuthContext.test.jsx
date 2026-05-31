import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

function AuthConsumer() {
  const { user, login, logout, updateUser } = useAuth()

  return (
    <div>
      <span data-testid="email">{user?.email || 'guest'}</span>
      <span data-testid="verified">{String(user?.verified ?? 'none')}</span>
      <button
        type="button"
        onClick={() =>
          login({
            token: 'token-123',
            user: { id: 1, email: 'learner@example.com', role: 'learner' },
          })
        }
      >
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          updateUser({
            id: 1,
            email: 'updated@example.com',
            role: 'learner',
            verified: true,
          })
        }
      >
        Update
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  it('loads a stored user when token and user exist', async () => {
    localStorage.setItem('token', 'token-123')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, email: 'stored@example.com', role: 'learner' })
    )

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('stored@example.com')
    })
    expect(screen.getByTestId('verified').textContent).toBe('false')
  })

  it('login stores token and normalized user', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    screen.getByText('Login').click()

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('learner@example.com')
    })
    expect(localStorage.getItem('token')).toBe('token-123')
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({
      email: 'learner@example.com',
      verified: false,
    })
  })

  it('updateUser persists the new user and logout clears auth state', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    screen.getByText('Update').click()

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('updated@example.com')
    })
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({
      email: 'updated@example.com',
      verified: true,
    })

    screen.getByText('Logout').click()

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('guest')
    })
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})

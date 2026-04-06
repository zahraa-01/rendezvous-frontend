import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import App from '../App'
import { vi } from 'vitest'

vi.mock('../api/client', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return { default: mockApi }
})

import api from '../api/client'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Login page', () => {
  it('renders all form fields', () => {
    renderApp('/login')
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('updates input values on typing', () => {
    renderApp('/login')
    const usernameInput = screen.getByLabelText(/username/i)
    fireEvent.change(usernameInput, { target: { value: 'alice' } })
    expect(usernameInput.value).toBe('alice')
  })

  it('calls API on form submit', async () => {
    api.post.mockResolvedValueOnce({
      data: { access: 'fake-access', refresh: 'fake-refresh' },
    })
    api.get.mockResolvedValueOnce({
      data: { id: 1, username: 'alice', email: 'alice@test.com' },
    })

    renderApp('/login')
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/token/', {
        username: 'alice',
        password: 'pass123',
      })
    })
  })

  it('shows error on failed login', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { detail: 'No active account found with the given credentials' } },
    })

    renderApp('/login')
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText(/no active account/i)).toBeInTheDocument()
    })
  })
})

describe('Register page', () => {
  it('renders all form fields', () => {
    renderApp('/register')
    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('updates input values on typing', () => {
    renderApp('/register')
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } })
    expect(emailInput.value).toBe('alice@example.com')
  })

  it('shows error when passwords do not match', async () => {
    renderApp('/register')
    fireEvent.change(screen.getByLabelText(/^username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Pass123!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Different!' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('shows field error from API', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { email: ['A user with that email already exists.'] } },
    })

    renderApp('/register')
    fireEvent.change(screen.getByLabelText(/^username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Pass123!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Pass123!' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })
})

describe('Routing', () => {
  it('navigates between login and register via links', () => {
    renderApp('/login')
    expect(screen.getByText(/welcome back/i, { selector: 'h1' })).toBeInTheDocument()
    const formLink = screen.getByText(/register/i, { selector: '.auth-switch a' })
    fireEvent.click(formLink)
    expect(screen.getByText(/join rendezvous/i, { selector: 'h1' })).toBeInTheDocument()
  })
})

describe('Landing page', () => {
  it('shows Login and Register action buttons when unauthenticated', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('does not show navbar on landing page', () => {
    renderApp('/')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('Navbar auth state', () => {
  it('shows Profile and Logout after login', async () => {
    api.post.mockResolvedValueOnce({
      data: { access: 'fake-access', refresh: 'fake-refresh' },
    })
    api.get.mockResolvedValueOnce({
      data: { id: 1, username: 'alice', email: 'alice@test.com' },
    })

    renderApp('/login')
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })
  })
})
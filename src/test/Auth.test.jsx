import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import App from '../App'

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
  it('shows Profile and Logout after login', () => {
    renderApp('/login')
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})
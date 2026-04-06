import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className={`navbar${isAuthenticated ? ' authenticated' : ''}`}>
      {isAuthenticated && (
        <Link to="/" className="navbar-brand">Rendezvous</Link>
      )}
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={logout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
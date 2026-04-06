import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isLanding = location.pathname === '/' && !isAuthenticated
  const isLoginPage = location.pathname === '/login' && !isAuthenticated
  const isRegisterPage = location.pathname === '/register' && !isAuthenticated

  return (
    <>
      {!isLanding && !isLoginPage && !isRegisterPage && <Navbar />}
      {isLanding ? (
        <div className="landing">
          <h1>Rendezvous</h1>
          <p>
            Experience the world authentically — through the eyes of
            travellers, lovers, dreamers and explorers.
          </p>
          <div className="home-actions">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/register" className="btn-secondary">Register</Link>
          </div>
        </div>
      ) : (
        <main className={`main-content${isLoginPage ? ' gradient-login' : ''}${isRegisterPage ? ' gradient-register' : ''}`}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" /> : <Register />}
            />
            <Route
              path="/"
              element={
                <div className="home-page">
                  <h1>Rendezvous</h1>
                  <p>Welcome back! Explore your places.</p>
                </div>
              }
            />
          </Routes>
        </main>
      )}
    </>
  )
}

export default App
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Places from './pages/Places'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
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
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/places" />
          ) : (
            <main className="main-content gradient-login">
              <Login />
            </main>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/places" />
          ) : (
            <main className="main-content gradient-register">
              <Register />
            </main>
          )
        }
      />
      <Route
        path="/places"
        element={
          <ProtectedRoute>
            <Navbar />
            <main className="main-content">
              <Places />
            </main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navbar />
            <main className="main-content">
              <Profile />
            </main>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
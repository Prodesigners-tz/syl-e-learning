import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Navbar feature finalized
export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isQuiz = location.pathname.startsWith('/quiz/')

  async function handleLogout() {
    if (isQuiz) {
      window.dispatchEvent(new Event('quiz-exit'))
      return
    }

    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      {isQuiz ? (
        <span className="brand">
          <span className="badge-dot" />
          SYL — Kiongozi Mwandamizi
        </span>
      ) : (
        <Link to={user ? '/dashboard' : '/'} className="brand">
          <span className="badge-dot" />
          SYL — Kiongozi Mwandamizi
        </Link>
      )}

      <div className="navbar-links">
        {user && profile?.role === 'admin' && (
          isQuiz ? <span>Admin</span> : <Link to="/admin/approvals">Admin</Link>
        )}

        {user && (
          isQuiz ? <span>Kozi Zangu</span> : <Link to="/dashboard">Kozi Zangu</Link>
        )}

        {user && (
          isQuiz ? <span>Cheti</span> : <Link to="/certificate">Cheti</Link>
        )}

        {user && (
          <button onClick={handleLogout}>Toka</button>
        )}
      </div>
    </nav>
  )
}
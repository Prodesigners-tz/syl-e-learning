import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand">
        <span className="badge-dot" />
        SYL — Kiongozi Mwandamizi
      </Link>

      <div className="navbar-links">
        {user && profile?.role === 'admin' && (
          <Link to="/admin/approvals">Admin</Link>
        )}

        {user && (
          <Link to="/dashboard">Kozi Zangu</Link>
        )}

        {user && (
          <Link to="/certificate">Cheti</Link>
        )}

        {user && (
          <button onClick={handleLogout}>Toka</button>
        )}
      </div>
    </nav>
  )
}
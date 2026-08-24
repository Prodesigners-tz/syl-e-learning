import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <h1>Karibu tena</h1>
      <p className="auth-sub">Ingia ili kuendelea na kozi yako.</p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Barua pepe</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Nenosiri</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Inaingia…' : 'Ingia'}
        </button>
      </form>
      <div className="auth-switch">
        Huna akaunti? <Link to="/signup">Jisajili hapa</Link>
      </div>
    </div>
  )
}

function mapAuthError(err) {
  const code = err?.code || ''
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Barua pepe au nenosiri si sahihi.'
  }
  if (code.includes('too-many-requests')) {
    return 'Majaribio mengi. Tafadhali subiri kidogo kisha jaribu tena.'
  }
  return 'Imeshindikana kuingia. Jaribu tena.'
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [churches, setChurches] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [churchId, setChurchId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function loadChurches() {
      const q = query(collection(db, 'churches'), orderBy('name'))
      const snap = await getDocs(q)
      setChurches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }
    loadChurches().catch(() => setError('Imeshindikana kupakia orodha ya makanisa.'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!churchId) {
      setError('Tafadhali chagua kanisa lako.')
      return
    }
    setBusy(true)
    try {
      await signup({ name, email, password, churchId })
      navigate('/pending-approval')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <h1>Fungua akaunti</h1>
      <p className="auth-sub">
        Baada ya kujisajili, mchungaji wa kanisa lako atatuma idhini kabla ya
        akaunti yako kuwashwa.
      </p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Jina kamili</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Barua pepe</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Nenosiri</label>
          <input
            id="password"
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="church">Kanisa lako</label>
          <select id="church" value={churchId} onChange={(e) => setChurchId(e.target.value)} required>
            <option value="">— Chagua kanisa —</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Inasajili…' : 'Jisajili'}
        </button>
      </form>
      <div className="auth-switch">
        Una akaunti tayari? <Link to="/login">Ingia hapa</Link>
      </div>
    </div>
  )
}

function mapAuthError(err) {
  const code = err?.code || ''
  if (code.includes('email-already-in-use')) return 'Barua pepe hii tayari imesajiliwa.'
  if (code.includes('weak-password')) return 'Nenosiri ni fupi mno (angalau herufi 6).'
  return 'Imeshindikana kujisajili. Jaribu tena.'
}

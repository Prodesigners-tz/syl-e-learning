import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { MODULES } from '../data/modules'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      const snap = await getDocs(collection(db, 'users', user.uid, 'progress'))
      const map = {}
      snap.forEach((d) => { map[d.id] = d.data() })
      setProgressMap(map)
      setLoading(false)
    }
    if (user) loadProgress()
  }, [user])

  function statusFor(module) {
    const p = progressMap[module.id]
    if (p?.status === 'passed') return 'passed'
    return p?.status === 'failed' ? 'failed' : 'available'
  }

  const passedCount = Object.values(progressMap).filter((p) => p.status === 'passed').length

  return (
    <div>
      <div className="dash-header">
        <div className="eyebrow">SYL — Kiongozi Mwandamizi wa Vijana Wakubwa</div>
        <h1>Karibu, {profile?.name?.split(' ')[0] || ''}</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Umekamilisha moduli {passedCount} kati ya {MODULES.length}.
        </p>
      </div>

      {loading ? (
        <p>Inapakia maendeleo yako…</p>
      ) : (
        <div className="module-grid">
          {MODULES.map((m, i) => {
            const status = statusFor(m)
            const locked = status === 'locked'
            const card = (
              <div className="module-card" key={m.id} style={locked ? { opacity: 0.6 } : {}}>
                <span className={`status-pill ${status}`}>
                  {status === 'passed' && 'Imekamilika'}
                  {status === 'available' && 'Endelea'}
                  {status === 'locked' && 'Imefungwa'}
                  {status === 'failed' && 'Jaribu tena'}
                </span>
                <div className="mod-number">SEMINA {m.order}</div>
                <h3>{m.title}</h3>
                <p>{m.subtitle}</p>
              </div>
            )
            return locked ? (
              <div key={m.id}>{card}</div>
            ) : (
              <Link to={`/module/${m.id}`} key={m.id} style={{ textDecoration: 'none' }}>
                {card}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

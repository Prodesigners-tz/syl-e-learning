import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { MODULES } from '../data/modules'

export default function Certificate() {
  const { user, profile } = useAuth()
  const [passedCount, setPassedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'users', user.uid, 'progress'))
      let count = 0
      snap.forEach((d) => { if (d.data().status === 'passed') count += 1 })
      setPassedCount(count)
      setLoading(false)
    }
    if (user) load()
  }, [user])

  if (loading) return <p>Inaangalia maendeleo yako…</p>

  const complete = passedCount >= MODULES.length

  if (!complete) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Cheti bado halijafunguka</h2>
        <p style={{ color: 'var(--color-muted)' }}>
          Umekamilisha moduli {passedCount} kati ya {MODULES.length}. Maliza moduli
          zote (pamoja na sehemu ya vitendo na mentor) ili upate cheti chako.
        </p>
      </div>
    )
  }

  return (
    <div className="certificate">
      <div className="cert-eyebrow">Kanisa la Waadventista Wasabato — Idara ya Vijana</div>
      <h1>Cheti cha Ukamilifu</h1>
      <p style={{ color: 'var(--color-muted)' }}>Kinathibitisha kwamba</p>
      <div className="cert-name">{profile?.name}</div>
      <p style={{ color: 'var(--color-muted)' }}>
        amekamilisha kwa mafanikio mtaala wa <strong>Kiongozi Mwandamizi wa Vijana Wakubwa (SYL)</strong>,
        semina zote {MODULES.length}, na kutimiza masharti ya vitendo chini ya uongozi wa mentor.
      </p>
      <p style={{ marginTop: 28, fontSize: '0.82rem', color: 'var(--color-muted)' }}>
        Tarehe: {new Date().toLocaleDateString('sw-TZ')}
      </p>
    </div>
  )
}

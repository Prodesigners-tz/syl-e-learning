import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../../firebase'

export default function AdminApprovals() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const q = query(collection(db, 'users'), where('status', '==', 'pending'))
    const snap = await getDocs(q)
    const rows = []
    for (const d of snap.docs) {
      const data = d.data()
      let churchName = '—'
      if (data.churchId) {
        const churchSnap = await getDoc(doc(db, 'churches', data.churchId))
        if (churchSnap.exists()) churchName = churchSnap.data().name
      }
      rows.push({ id: d.id, ...data, churchName })
    }
    setPending(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function setStatus(uid, status) {
    await updateDoc(doc(db, 'users', uid), { status })
    setPending((prev) => prev.filter((u) => u.id !== uid))
  }

  return (
    <div>
      <h1>Idhini za Usajili</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        Kwa kawaida mchungaji anaidhinisha kwa kubofya link kwenye barua pepe
        yake. Ukurasa huu ni njia ya nyongeza kwa admin kuidhinisha moja kwa
        moja endapo itahitajika.
      </p>
      <div style={{ marginBottom: 16 }}>
        <Link to="/admin/churches" className="btn btn-secondary">Simamia Makanisa</Link>
      </div>

      {loading ? (
        <p>Inapakia…</p>
      ) : pending.length === 0 ? (
        <p>Hakuna maombi yanayosubiri kwa sasa.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Jina</th><th>Barua Pepe</th><th>Kanisa</th><th>Hatua</th></tr>
          </thead>
          <tbody>
            {pending.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.churchName}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setStatus(u.id, 'approved')}>Idhinisha</button>
                  <button className="btn btn-danger" onClick={() => setStatus(u.id, 'rejected')}>Kataa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

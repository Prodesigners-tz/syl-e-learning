import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

export default function AdminChurches() {
  const [churches, setChurches] = useState([])
  const [name, setName] = useState('')
  const [pastorName, setPastorName] = useState('')
  const [pastorEmail, setPastorEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function loadChurches() {
    const q = query(collection(db, 'churches'), orderBy('name'))
    const snap = await getDocs(q)
    setChurches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { loadChurches() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      await addDoc(collection(db, 'churches'), {
        name,
        pastorName,
        pastorEmail,
        createdAt: serverTimestamp(),
      })
      setName(''); setPastorName(''); setPastorEmail('')
      setMsg('Kanisa limeongezwa.')
      loadChurches()
    } catch {
      setMsg('Imeshindikana kuongeza kanisa.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1>Makanisa</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        Ongeza kanisa na barua pepe ya mchungaji wake. Wanachama watachagua
        kanisa hili wanapojisajili, na ombi lao litaenda kwa barua pepe hii.
      </p>

      <div className="card">
        <form onSubmit={handleAdd}>
          <div className="field">
            <label>Jina la Kanisa</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Jina la Mchungaji</label>
            <input value={pastorName} onChange={(e) => setPastorName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Barua Pepe ya Mchungaji</label>
            <input type="email" value={pastorEmail} onChange={(e) => setPastorEmail(e.target.value)} required />
          </div>
          {msg && <p style={{ fontSize: '0.85rem' }}>{msg}</p>}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Inaongeza…' : 'Ongeza Kanisa'}</button>
        </form>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>Kanisa</th><th>Mchungaji</th><th>Barua Pepe</th></tr>
        </thead>
        <tbody>
          {churches.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.pastorName}</td>
              <td>{c.pastorEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

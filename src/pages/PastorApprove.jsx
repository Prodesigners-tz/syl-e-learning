import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Ukurasa huu unafunguliwa na MCHUNGAJI kutoka kwenye link ya barua pepe —
// hahitaji kuingia (login). Unaita Cloud Function `approveByPastor` (tazama
// functions/index.js) ambayo inathibitisha token kisha kubadili status ya
// mtumiaji kuwa 'approved'.

export default function PastorApprove() {
  const [params] = useSearchParams()
  const [state, setState] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const uid = params.get('uid')
    const token = params.get('token')
    if (!uid || !token) {
      setState('error')
      setMessage('Link hii si sahihi au imekamilika muda wake.')
      return
    }

    const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL
    fetch(`${functionsBaseUrl}/approveByPastor?uid=${uid}&token=${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        setState('success')
      })
      .catch((err) => {
        setState('error')
        setMessage(err.message || 'Imeshindikana kuidhinisha.')
      })
  }, [params])

  return (
    <div className="auth-wrap" style={{ textAlign: 'center' }}>
      {state === 'loading' && <p>Inathibitisha…</p>}
      {state === 'success' && (
        <>
          <h1>Umeidhinisha!</h1>
          <p className="auth-sub">Asante. Kijana huyu sasa anaweza kuanza kozi.</p>
        </>
      )}
      {state === 'error' && (
        <>
          <h1>Imeshindikana</h1>
          <p className="auth-sub">{message}</p>
        </>
      )}
    </div>
  )
}

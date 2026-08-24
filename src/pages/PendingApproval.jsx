import { useAuth } from '../context/AuthContext'

export default function PendingApproval() {
  const { profile, logout } = useAuth()

  return (
    <div className="auth-wrap" style={{ textAlign: 'center' }}>
      <h1>Akaunti inasubiri idhini</h1>
      <p className="auth-sub">
        Habari {profile?.name || ''}, tumepokea usajili wako. Mchungaji wa
        kanisa lako amepata ombi lako kwa barua pepe na anahitaji kulithibitisha
        kabla hujaweza kuanza kozi. Utapokea barua pepe mara akaunti yako
        itakapoidhinishwa.
      </p>
      <button className="btn btn-secondary" onClick={logout}>Toka</button>
    </div>
  )
}

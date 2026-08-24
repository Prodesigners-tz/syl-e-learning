import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import '../styles/login.css'

export default function Login() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const [flipped, setFlipped] = useState(false)

  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  // Signup
  const [churches, setChurches] = useState([])
  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [churchId, setChurchId] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupBusy, setSignupBusy] = useState(false)

  useEffect(() => {
    async function loadChurches() {
      try {
        const q = query(collection(db, 'churches'), orderBy('name'))
        const snap = await getDocs(q)

        setChurches(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }))
        )
      } catch {
        setSignupError('Imeshindikana kupakia orodha ya makanisa.')
      }
    }

    loadChurches()
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginBusy(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setLoginError(mapLoginError(err))
    } finally {
      setLoginBusy(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setSignupError('')

    if (!churchId) {
      setSignupError('Tafadhali chagua kanisa lako.')
      return
    }

    setSignupBusy(true)

    try {
      await signup({
        name,
        email: signupEmail,
        password: signupPassword,
        churchId
      })

      navigate('/pending-approval')
    } catch (err) {
      setSignupError(mapSignupError(err))
    } finally {
      setSignupBusy(false)
    }
  }

  return (
    <div className={`login-page ${flipped ? 'is-flipped' : ''}`}>
      <div className="login-orb">

        {/* LOGIN SIDE */}
        <div className="login-face login-front">
          <div className="login-orb-inner">

            <div className="login-brand">SYL</div>

            <div className="login-title">
              Karibu tena
            </div>

            <div className="login-subtitle">
              Ingia ili kuendelea na kozi yako.
            </div>

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleLogin}
            >
              <div className="login-field">
                <label htmlFor="login-email">
                  Barua pepe
                </label>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Weka barua pepe yako"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  Nenosiri
                </label>

                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Weka nenosiri lako"
                  required
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loginBusy}
              >
                {loginBusy ? 'Inaingia…' : 'INGIA'}
              </button>
            </form>

            <button
              type="button"
              className="flip-link"
              onClick={() => setFlipped(true)}
            >
              Huna akaunti?
              <strong> Jisajili hapa</strong>
            </button>

          </div>
        </div>

        {/* SIGNUP SIDE */}
        <div className="login-face login-back">
          <div className="login-orb-inner signup-inner">

            <div className="login-brand small-brand">
              SYL
            </div>

            <div className="login-title">
              Fungua akaunti
            </div>

            <div className="login-subtitle">
              Jisajili ili kuanza kujifunza.
            </div>

            {signupError && (
              <div className="login-error">
                {signupError}
              </div>
            )}

            <form
              className="login-form signup-form"
              onSubmit={handleSignup}
            >
              <div className="login-field">
                <label htmlFor="signup-name">
                  Jina kamili
                </label>

                <input
                  id="signup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jina lako"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="signup-email">
                  Barua pepe
                </label>

                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Barua pepe yako"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="signup-password">
                  Nenosiri
                </label>

                <input
                  id="signup-password"
                  type="password"
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Angalau herufi 6"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="signup-church">
                  Kanisa lako
                </label>

                <select
                  id="signup-church"
                  value={churchId}
                  onChange={(e) => setChurchId(e.target.value)}
                  required
                >
                  <option value="">
                    — Chagua kanisa —
                  </option>

                  {churches.map((church) => (
                    <option
                      key={church.id}
                      value={church.id}
                    >
                      {church.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={signupBusy}
              >
                {signupBusy ? 'Inasajili…' : 'JISAJILI'}
              </button>
            </form>

            <button
              type="button"
              className="flip-link"
              onClick={() => setFlipped(false)}
            >
              Una akaunti tayari?
              <strong> Ingia hapa</strong>
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}

function mapLoginError(err) {
  const code = err?.code || ''

  if (
    code.includes('user-not-found') ||
    code.includes('wrong-password') ||
    code.includes('invalid-credential')
  ) {
    return 'Barua pepe au nenosiri si sahihi.'
  }

  if (code.includes('too-many-requests')) {
    return 'Majaribio mengi. Tafadhali subiri kidogo kisha jaribu tena.'
  }

  return 'Imeshindikana kuingia. Jaribu tena.'
}

function mapSignupError(err) {
  const code = err?.code || ''

  if (code.includes('email-already-in-use')) {
    return 'Barua pepe hii tayari imesajiliwa.'
  }

  if (code.includes('weak-password')) {
    return 'Nenosiri ni fupi mno (angalau herufi 6).'
  }

  return 'Imeshindikana kujisajili. Jaribu tena.'
}
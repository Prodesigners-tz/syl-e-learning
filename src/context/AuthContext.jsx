import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // Firebase Auth user
  const [profile, setProfile] = useState(null) // Firestore users/{uid} doc
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signup({ name, email, password, churchId }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const userDoc = {
      name,
      email,
      churchId: churchId || null,
      role: 'student',
      // TESTING MODE: skipping pastor approval so signup -> immediate access.
      // Kurudisha pastor-approval baadaye: badilisha hii kuwa 'pending' na
      // rudisha church dropdown + required kwenye Signup.jsx.
      status: 'approved',
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), userDoc)
    setProfile({ id: cred.user.uid, ...userDoc })
    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  const value = { user, profile, loading, signup, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

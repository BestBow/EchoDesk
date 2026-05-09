'use client'

import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { api } from '../api/client'

interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  firebaseUser: FirebaseUser
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          const { data } = await api.auth.exchange(idToken)
          localStorage.setItem('echodesk_token', data.accessToken)
          setUser({ ...data.user, firebaseUser })
        } catch {
          setUser(null)
        }
      } else {
        localStorage.removeItem('echodesk_token')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result
  }

  const registerWithEmail = async (
    email: string,
    password: string,
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return result
  }

  const logout = async () => {
    localStorage.removeItem('echodesk_token')
    await signOut(auth)
    setUser(null)
  }

  return {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  }
}

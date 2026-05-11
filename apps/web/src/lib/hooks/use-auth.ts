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
import apiClient from '../api/client'

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
          const idToken = await firebaseUser.getIdToken(true)
          const { data } = await apiClient.post('/auth/exchange', { idToken })
          window.localStorage.setItem('echodesk_token', data.accessToken)
          setUser({ ...data.user, firebaseUser })
        } catch (err: any) {
          console.error('Exchange failed:', err?.response?.data ?? err?.message)
          setUser(null)
        }
      } else {
        window.localStorage.removeItem('echodesk_token')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithEmail = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const registerWithEmail = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const logout = async () => {
    window.localStorage.removeItem('echodesk_token')
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
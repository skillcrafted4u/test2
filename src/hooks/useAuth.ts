import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authService } from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getCurrentSession().then(session => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    const result = await authService.signUp(email, password)
    setLoading(false)
    return result
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await authService.signIn(email, password)
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    const result = await authService.signOut()
    setLoading(false)
    return result
  }

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email)
  }

  const updatePassword = async (password: string) => {
    return await authService.updatePassword(password)
  }

  const updateProfile = async (updates: { email?: string; data?: any }) => {
    return await authService.updateProfile(updates)
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }
}
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      return { user: data.user, error }
    } catch (error) {
      console.error('Error signing up:', error)
      return { user: null, error }
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { user: data.user, error }
    } catch (error) {
      console.error('Error signing in:', error)
      return { user: null, error }
    }
  }

  // Sign out
  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      return { error }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { error }
    }
  }

  // Update password
  async updatePassword(password: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      return { error }
    } catch (error) {
      console.error('Error updating password:', error)
      return { error }
    }
  }

  // Update user profile
  async updateProfile(updates: { email?: string; data?: any }): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.updateUser(updates)
      return { error }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error }
    }
  }
}

export const authService = new AuthService()
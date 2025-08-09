import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp, resetPassword, loading } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (mode === 'reset') {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset email sent! Check your inbox.')
      }
      return
    }

    const { user, error } = mode === 'signin' 
      ? await signIn(email, password)
      : await signUp(email, password)

    if (error) {
      setError(error.message)
    } else if (user) {
      if (mode === 'signup') {
        setSuccess('Account created! Please check your email to verify your account.')
      } else {
        onClose()
      }
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Join Wanderlust'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <p className="text-white/70">
            {mode === 'signin' && 'Sign in to save and sync your trips'}
            {mode === 'signup' && 'Create an account to save your adventures'}
            {mode === 'reset' && 'Enter your email to reset your password'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-200 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => switchMode('reset')}
                className="text-white/70 hover:text-white text-sm transition-colors duration-200"
              >
                Forgot your password?
              </button>
              <div className="text-white/60 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-white hover:text-yellow-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-white/60 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-white hover:text-yellow-300 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-white/60 text-sm">
              Remember your password?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-white hover:text-yellow-300 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-white/60 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/authService'
import {
  validateEmail,
  validatePassword,
  validateRequired
} from '../utils/validation'
import type { UserRole } from '../types/database'

export function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const nameErr = validateRequired(name, 'Name')
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    if (nameErr || emailErr || passErr) {
      setError(nameErr || emailErr || passErr || '')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { session } = await signUp({ email, password, name, role })
      if (session) {
        navigate(role === 'brand' ? '/brand/dashboard' : '/marketplace', {
          replace: true
        })
      } else {
        setSuccess('Check your email to confirm your account, then sign in.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <p className="text-gold-dark font-medium tracking-[0.15em] uppercase text-xs mb-2">
          Join us
        </p>
        <h1 className="text-4xl font-display font-medium text-ink mb-2">Create account</h1>
        <p className="text-charcoal/70 mb-8">Join MarketNest as a Brand or Customer</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-sm bg-red-50/80 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-sm bg-green-50/80 text-green-800 text-sm border border-green-100">
              {success}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">
              I want to
            </label>
            <div className="flex gap-6">
              <label
                className={`flex items-center gap-3 cursor-pointer py-3 px-4 rounded-sm border-2 transition-all flex-1 ${
                  role === 'user' ? 'border-ink bg-ink/5' : 'border-sand hover:border-charcoal/40'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="sr-only"
                />
                <span className="font-medium">Shop as Customer</span>
              </label>
              <label
                className={`flex items-center gap-3 cursor-pointer py-3 px-4 rounded-sm border-2 transition-all flex-1 ${
                  role === 'brand' ? 'border-ink bg-ink/5' : 'border-sand hover:border-charcoal/40'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="brand"
                  checked={role === 'brand'}
                  onChange={() => setRole('brand')}
                  className="sr-only"
                />
                <span className="font-medium">Sell as Brand</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium tracking-wide shadow-soft"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-charcoal/70 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-ink font-medium hover:text-gold-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

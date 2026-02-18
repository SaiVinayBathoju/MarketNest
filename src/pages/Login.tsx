import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signIn } from '../services/authService'
import { validateEmail, validatePassword } from '../utils/validation'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    if (emailErr || passErr) {
      setError(emailErr || passErr || '')
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <p className="text-gold-dark font-medium tracking-[0.15em] uppercase text-xs mb-2">
          Welcome back
        </p>
        <h1 className="text-4xl font-display font-medium text-ink mb-2">Sign in</h1>
        <p className="text-charcoal/70 mb-8">Sign in to your MarketNest account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-sm bg-red-50/80 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
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
              autoComplete="email"
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
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium tracking-wide shadow-soft"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-charcoal/70 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-ink font-medium hover:text-gold-dark transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

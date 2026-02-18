import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../services/authService'

export function Layout({ children }: { children: React.ReactNode }) {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await signOut()
    } catch {
      // Ignore - still navigate
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-2xl font-display font-medium text-ink tracking-wide hover:text-gold-dark transition-colors"
          >
            <img src="/logo.svg" alt="" className="w-9 h-9" />
            MarketNest
          </Link>
          <nav className="flex items-center gap-6 sm:gap-8">
            {session ? (
              <>
                <Link
                  to="/brand/dashboard"
                  className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                >
                  Dashboard
                </Link>
                <Link
                  to="/marketplace"
                  className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                >
                  Marketplace
                </Link>
                {profile?.role === 'user' && (
                  <Link
                    to="/profile"
                    className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all text-sm font-medium tracking-wide shadow-soft"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 min-h-[60vh]">{children}</main>
    </div>
  )
}

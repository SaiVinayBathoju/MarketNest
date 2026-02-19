import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { signOut } from '../services/authService'

export function Layout({ children }: { children: React.ReactNode }) {
  const { session, profile } = useAuth()
  const { itemCount } = useCart()
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
                {profile?.role === 'brand' && (
                  <Link
                    to="/brand/dashboard"
                    className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                  >
                    Dashboard
                  </Link>
                )}
                {profile?.role === 'user' && (
                  <>
                    <Link
                      to="/marketplace"
                      className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                    >
                      Marketplace
                    </Link>
                    <Link
                      to="/wishlist"
                      className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/cart"
                      className="relative text-charcoal/80 hover:text-ink transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold-dark text-cream text-xs font-semibold rounded-full flex items-center justify-center">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="text-charcoal/80 hover:text-ink transition-colors text-sm font-medium tracking-wide"
                >
                  Profile
                </Link>
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

import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Home() {
  const { session, profile } = useAuth()

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sand/30 via-cream to-cream" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-light/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-28 md:py-40 text-center">
        <img src="/logo.svg" alt="" className="w-16 h-16 mx-auto mb-4" />
        <p className="text-gold-dark font-medium tracking-[0.2em] uppercase text-sm mb-4">
          Curated Fashion
        </p>
        <h1 className="text-5xl md:text-7xl font-display font-medium text-ink mb-6 tracking-tight leading-[1.1]">
          MarketNest
        </h1>
        <p className="text-lg md:text-xl text-charcoal/70 max-w-xl mx-auto mb-12 leading-relaxed">
          Discover distinctive brands. Showcase your collection. Your curated fashion marketplace.
        </p>
        {!session ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              to="/signup"
              className="px-10 py-4 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all font-medium tracking-wide shadow-card hover:shadow-elevated hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 border-2 border-charcoal/30 text-ink rounded-sm hover:border-charcoal hover:bg-charcoal/5 transition-all font-medium tracking-wide"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {profile?.role === 'brand' && (
              <Link
                to="/brand/dashboard"
                className="px-10 py-4 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all font-medium tracking-wide shadow-card"
              >
                Go to Dashboard
              </Link>
            )}
            {profile?.role === 'user' && (
              <Link
                to="/marketplace"
                className="px-10 py-4 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all font-medium tracking-wide shadow-card"
              >
                Browse Marketplace
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

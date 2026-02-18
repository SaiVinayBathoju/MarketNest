import { useEffect, useRef, useLayoutEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMarketplace } from '../contexts/MarketplaceContext'

const CATEGORIES = ['All', 'Apparel', 'Footwear', 'Accessories', 'Bags', 'Jewelry', 'Other']

export function Marketplace() {
  const {
    products,
    page,
    hasMore,
    category,
    loading,
    loadingMore,
    error,
    setCategory,
    loadPage,
    saveScrollPosition,
    getSavedScrollPosition,
    clearScrollPosition,
    hasCachedDataForCategory
  } = useMarketplace()

  const location = useLocation()
  const isReturningRef = useRef(false)
  const prevCategoryRef = useRef(category)

  // Fetch when category changes (user clicked a different category)
  useEffect(() => {
    if (prevCategoryRef.current !== category) {
      prevCategoryRef.current = category
      loadPage(1, false)
    }
  }, [category, loadPage])

  // Initial load: only fetch if we don't have cached data for this category
  useEffect(() => {
    if (!hasCachedDataForCategory(category)) {
      loadPage(1, false)
    } else {
      isReturningRef.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- only on mount

  // Restore scroll position when mounting (returned from product detail) or when tab becomes visible
  useLayoutEffect(() => {
    const restore = () => {
      const saved = getSavedScrollPosition()
      if (saved > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved, behavior: 'auto' })
          clearScrollPosition()
        })
      }
    }
    if (isReturningRef.current) {
      isReturningRef.current = false
      restore()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        restore()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [location.pathname, getSavedScrollPosition, clearScrollPosition])

  // Save scroll position when leaving the page or when tab becomes hidden
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      saveScrollPosition()
    }
  }, [saveScrollPosition])

  function handleLoadMore() {
    loadPage(page + 1, true)
  }

  const showContent = hasCachedDataForCategory(category) || !loading
  const showProducts = products.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-[500px]">
      <p className="text-gold-dark font-medium tracking-[0.15em] uppercase text-xs mb-2">
        Discover
      </p>
      <h1 className="text-4xl font-display font-medium text-ink mb-10">
        Marketplace
      </h1>

      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-5 py-2.5 rounded-sm text-sm font-medium transition-all ${
              category === c
                ? 'bg-ink text-cream shadow-soft'
                : 'bg-white border border-sand text-charcoal hover:border-charcoal/30 hover:text-ink'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-sm bg-red-50/80 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {loading && !showContent ? (
        <div className="flex flex-col items-center justify-center py-28 bg-sand/30 rounded-sm">
          <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
          <p className="text-charcoal/70">Loading products...</p>
        </div>
      ) : !showProducts ? (
        <div className="text-center py-28 px-8 bg-sand/20 border border-sand rounded-sm">
          <p className="text-2xl font-display font-medium text-ink mb-3">No products yet.</p>
          <p className="text-charcoal/70 max-w-md mx-auto">
            Products will appear here once brands add their collections. Check back soon.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                state={{ from: 'marketplace' }}
                className="group block bg-white overflow-hidden rounded-sm shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-ink group-hover:text-gold-dark transition-colors">
                    {p.name}
                  </h3>
                  {p.category && (
                    <p className="text-xs text-charcoal/60 mt-1 tracking-wide">{p.category}</p>
                  )}
                  {p.description && (
                    <p className="text-sm text-charcoal/70 mt-2 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <p className="text-gold-dark font-semibold mt-2">
                    ${p.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="mt-14 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 border-2 border-charcoal/30 text-ink rounded-sm hover:border-ink hover:bg-ink/5 transition-all font-medium disabled:opacity-60"
              >
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

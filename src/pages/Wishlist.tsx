import { Link } from 'react-router-dom'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'
import { RatingStars } from '../components/RatingStars'
import { WishlistButton } from '../components/WishlistButton'
import { useState, useEffect } from 'react'
import type { Product } from '../types/database'
import { getProductRatingStats } from '../services/ratingService'

export function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [movingToCart, setMovingToCart] = useState<string | null>(null)
  const [ratingStats, setRatingStats] = useState<Record<string, { averageRating: number; totalRatings: number }>>({})

  useEffect(() => {
    async function loadRatingStats() {
      const stats: Record<string, { averageRating: number; totalRatings: number }> = {}
      for (const item of items) {
        try {
          const statsForProduct = await getProductRatingStats(item.product_id)
          stats[item.product_id] = statsForProduct
        } catch (error) {
          console.error(`Failed to load rating stats for product ${item.product_id}:`, error)
        }
      }
      setRatingStats(stats)
    }
    if (items.length > 0) {
      loadRatingStats()
    }
  }, [items])

  const handleMoveToCart = async (product: Product) => {
    setMovingToCart(product.id)
    try {
      await addToCart(product.id, 1)
      await removeFromWishlist(product.id)
    } catch (error) {
      console.error('Failed to move to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      setMovingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
        <p className="text-charcoal/70">Loading wishlist...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-display font-medium text-ink mb-10">Wishlist</h1>
        <div className="text-center py-28 px-8 bg-sand/20 border border-sand rounded-sm">
          <p className="text-2xl font-display font-medium text-ink mb-3">Your wishlist is empty</p>
          <p className="text-charcoal/70 mb-8">Save products you love for later.</p>
          <Link
            to="/marketplace"
            className="inline-block px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-display font-medium text-ink mb-10">Wishlist</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const product = item.products
          const stats = ratingStats[product.id]
          return (
            <div key={item.id} className="group relative bg-white overflow-hidden rounded-sm shadow-soft hover:shadow-card transition-all duration-300">
              <Link to={`/products/${product.id}`} className="block">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <WishlistButton productId={product.id} />
                  </div>
                </div>
                <div className="p-4 pb-20">
                  <h3 className="font-medium text-ink group-hover:text-gold-dark transition-colors">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-xs text-charcoal/60 mt-1 tracking-wide">{product.category}</p>
                  )}
                  {product.description && (
                    <p className="text-sm text-charcoal/70 mt-2 line-clamp-2">{product.description}</p>
                  )}
                  {stats && stats.totalRatings > 0 && (
                    <div className="mt-2">
                      <RatingStars rating={stats.averageRating} totalRatings={stats.totalRatings} size="sm" />
                    </div>
                  )}
                  <p className="text-gold-dark font-semibold mt-2">${product.price.toFixed(2)}</p>
                </div>
              </Link>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleMoveToCart(product)
                  }}
                  disabled={movingToCart === product.id}
                  className="flex-1 px-4 py-2 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {movingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeFromWishlist(product.id)
                  }}
                  className="px-4 py-2 border border-charcoal/30 text-charcoal/80 rounded-sm hover:border-red-500 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

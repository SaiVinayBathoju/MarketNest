import { Link } from 'react-router-dom'
import type { Product } from '../types/database'
import { RatingStars } from './RatingStars'
import { WishlistButton } from './WishlistButton'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { getProductRatingStats } from '../services/ratingService'
import { useEffect } from 'react'

interface ProductCardProps {
  product: Product
  showActions?: boolean
}

export function ProductCard({ product, showActions = true }: ProductCardProps) {
  const { addToCart } = useCart()
  const { isUser } = useAuth()
  const [addingToCart, setAddingToCart] = useState(false)
  const [ratingStats, setRatingStats] = useState<{ averageRating: number; totalRatings: number } | null>(null)

  useEffect(() => {
    async function loadRatingStats() {
      try {
        const stats = await getProductRatingStats(product.id)
        setRatingStats(stats)
      } catch (error) {
        console.error('Failed to load rating stats:', error)
      }
    }
    loadRatingStats()
  }, [product.id])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUser || addingToCart) return

    setAddingToCart(true)
    try {
      await addToCart(product.id, 1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="group relative bg-white overflow-hidden rounded-sm shadow-soft hover:shadow-card transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {showActions && isUser && (
            <div className="absolute top-2 right-2 z-10">
              <WishlistButton productId={product.id} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-ink group-hover:text-gold-dark transition-colors">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-xs text-charcoal/60 mt-1 tracking-wide">{product.category}</p>
          )}
          {product.description && (
            <p className="text-sm text-charcoal/70 mt-2 line-clamp-2">{product.description}</p>
          )}
          <div className="mt-2">
            {ratingStats && ratingStats.totalRatings > 0 ? (
              <RatingStars
                rating={ratingStats.averageRating}
                totalRatings={ratingStats.totalRatings}
                size="sm"
              />
            ) : (
              <div className="flex items-center gap-1">
                <RatingStars rating={0} size="sm" />
                <span className="text-xs text-charcoal/40">No ratings</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-gold-dark font-semibold">${product.price.toFixed(2)}</p>
            {showActions && isUser && (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="px-3 py-1.5 text-xs font-medium bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

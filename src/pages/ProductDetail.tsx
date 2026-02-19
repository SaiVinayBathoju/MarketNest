import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchProductById } from '../services/productService'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'
import { RatingStars } from '../components/RatingStars'
import { WishlistButton } from '../components/WishlistButton'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { getProductRatingStats, submitRating, getUserRating } from '../services/ratingService'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isUser, session } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [brandName, setBrandName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratingStats, setRatingStats] = useState<{ averageRating: number; totalRatings: number } | null>(null)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      setError('')
      try {
        const p = await fetchProductById(id!)
        setProduct(p)
        if (p) {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', p.brand_id)
            .single()
          setBrandName((data as { name?: string } | null)?.name ?? null)

          // Load rating stats
          try {
            const stats = await getProductRatingStats(p.id)
            setRatingStats(stats)
          } catch (e) {
            console.error('Failed to load rating stats:', e)
            setRatingStats({ averageRating: 0, totalRatings: 0 })
          }

          // Load user's rating if logged in
          if (isUser && session?.user?.id) {
            try {
              const userRatingData = await getUserRating(session.user.id, p.id)
              setUserRating(userRatingData?.rating ?? null)
            } catch (e) {
              console.error('Failed to load user rating:', e)
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isUser, session?.user?.id])

  const handleAddToCart = async () => {
    if (!isUser || !product || addingToCart) return
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

  const handleBuyNow = async () => {
    if (!isUser || !product || buyingNow) return
    setBuyingNow(true)
    try {
      await addToCart(product.id, 1)
      navigate('/checkout')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to proceed to checkout. Please try again.')
    } finally {
      setBuyingNow(false)
    }
  }

  const handleRatingSubmit = async (rating: number) => {
    if (!isUser || !product || !session?.user?.id || submittingRating) return
    
    setSubmittingRating(true)
    try {
      await submitRating(session.user.id, product.id, rating)
      setUserRating(rating)
      // Refresh rating stats
      const stats = await getProductRatingStats(product.id)
      setRatingStats(stats)
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
        <p className="text-charcoal/70">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-charcoal/70 mb-6">{error || 'Product not found.'}</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-ink font-medium hover:text-gold-dark transition-colors"
        >
          ← Back to Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-charcoal/70 hover:text-ink mb-10 text-sm font-medium transition-colors"
      >
        ← Back to Marketplace
      </Link>
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        <div className="aspect-square rounded-sm overflow-hidden bg-sand/30 shadow-card">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          {product.category && (
            <span className="text-xs text-gold-dark font-medium tracking-[0.2em] uppercase mb-2">
              {product.category}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-display font-medium text-ink leading-tight">
            {product.name}
          </h1>
          {brandName && (
            <p className="text-charcoal/70 mt-2">by {brandName}</p>
          )}
          <div className="mt-4">
            {ratingStats && ratingStats.totalRatings > 0 ? (
              <RatingStars
                rating={ratingStats.averageRating}
                totalRatings={ratingStats.totalRatings}
                size="md"
              />
            ) : (
              <div className="flex items-center gap-2">
                <RatingStars rating={0} size="md" />
                <span className="text-sm text-charcoal/50">No ratings yet</span>
              </div>
            )}
            {isUser && (
              <div className="mt-3">
                <p className="text-sm text-charcoal/70 mb-2">
                  {userRating ? `Your rating: ${userRating} stars` : 'Rate this product:'}
                </p>
                <RatingStars
                  rating={userRating ?? 0}
                  interactive={true}
                  onRatingChange={handleRatingSubmit}
                  size="md"
                />
              </div>
            )}
          </div>
          <p className="text-3xl font-semibold text-gold-dark mt-6">
            ${product.price.toFixed(2)}
          </p>
          {isUser && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBuyNow}
                disabled={buyingNow}
                className="flex-1 px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium disabled:opacity-50"
              >
                {buyingNow ? 'Processing...' : 'Buy Now'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 px-6 py-3 border-2 border-ink text-ink rounded-sm hover:bg-ink/5 transition-colors font-medium disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <div className="flex items-center justify-center">
                <WishlistButton productId={product.id} size="lg" />
              </div>
            </div>
          )}
          <div className="mt-8">
            <h2 className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-3">
              Description
            </h2>
            <p className="text-charcoal/80 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useWishlist } from '../contexts/WishlistContext'
import { useAuth } from '../contexts/AuthContext'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function WishlistButton({ productId, size = 'md', className = '' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isUser } = useAuth()
  const [isToggling, setIsToggling] = useState(false)

  if (!isUser) {
    return null
  }

  const inWishlist = isInWishlist(productId)
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isToggling) return

    setIsToggling(true)
    try {
      await toggleWishlist(productId)
      // Visual feedback is handled by optimistic updates in context
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isToggling}
      className={`${sizeClasses[size]} ${className} ${
        inWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-charcoal/40 hover:text-red-500'
      } transition-colors disabled:opacity-50`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`${sizeClasses[size]} ${inWishlist ? 'fill-current' : 'fill-none'} stroke-current`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        fill="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}

import { useState } from 'react'

interface RatingStarsProps {
  rating: number
  totalRatings?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RatingStars({
  rating,
  totalRatings,
  interactive = false,
  onRatingChange,
  size = 'md',
  className = ''
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const displayRating = hoveredRating ?? selectedRating ?? rating
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      setSelectedRating(value)
      onRatingChange(value)
    }
  }

  // Always show stars, but fill based on rating
  const shouldShowRating = rating > 0 || interactive || totalRatings === undefined

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= Math.round(displayRating)
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => interactive && setHoveredRating(value)}
              onMouseLeave={() => interactive && setHoveredRating(null)}
              disabled={!interactive}
              className={`${sizeClasses[size]} ${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform'
                  : 'cursor-default'
              } ${!interactive ? 'pointer-events-none' : ''}`}
              aria-label={`Rate ${value} out of 5`}
            >
              <svg
                className={`${sizeClasses[size]} ${
                  isFilled ? 'text-gold-dark fill-current' : 'text-charcoal/20 fill-current'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )
        })}
      </div>
      {shouldShowRating && (
        <span className="text-sm text-charcoal/70 ml-1">
          {rating > 0 ? (
            <>
              {rating.toFixed(1)}
              {totalRatings !== undefined && totalRatings > 0 && (
                <span className="text-charcoal/50"> ({totalRatings})</span>
              )}
            </>
          ) : interactive ? (
            <span className="text-charcoal/50">Click to rate</span>
          ) : totalRatings !== undefined && totalRatings === 0 ? (
            <span className="text-charcoal/50">No ratings</span>
          ) : null}
        </span>
      )}
    </div>
  )
}

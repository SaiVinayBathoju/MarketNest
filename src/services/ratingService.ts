import { supabase } from '../lib/supabase'
import type { ProductRating } from '../types/database'

export interface ProductRatingWithUser extends ProductRating {
  profiles: {
    name: string
  }
}

export interface ProductRatingStats {
  averageRating: number
  totalRatings: number
}

export async function fetchProductRatings(productId: string): Promise<ProductRatingWithUser[]> {
  const { data, error } = await supabase
    .from('product_ratings')
    .select(`
      *,
      profiles (name)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProductRatingWithUser[]
}

export async function getProductRatingStats(productId: string): Promise<ProductRatingStats> {
  try {
    const { data, error } = await supabase
      .from('product_ratings')
      .select('rating')
      .eq('product_id', productId)

    if (error) {
      // If RLS blocks the query, return empty stats instead of throwing
      if (error.code === '42501' || error.message.includes('permission')) {
        console.warn('Rating stats not accessible:', error.message)
        return { averageRating: 0, totalRatings: 0 }
      }
      throw error
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalRatings: 0 }
    }

    const typed = data as { rating: number }[]
    const totalRatings = typed.length
    const sum = typed.reduce((acc, r) => acc + r.rating, 0)
    const averageRating = sum / totalRatings

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings
    }
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    // Return empty stats on any error to prevent UI breakage
    return { averageRating: 0, totalRatings: 0 }
  }
}

export async function submitRating(
  userId: string,
  productId: string,
  rating: number,
  reviewText?: string
): Promise<ProductRating> {
  // Check if user already rated this product
  const { data: existing } = await supabase
    .from('product_ratings')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // Update existing rating
    const { data, error } = await supabase
      .from('product_ratings')
      // Cast payload to `never` to appease overly strict generic typing
      .update({
        rating,
        review_text: reviewText || null
      } as never)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as ProductRating
  } else {
    // Create new rating
    const { data, error } = await supabase
      .from('product_ratings')
      // Cast payload to `never` to appease overly strict generic typing
      .insert({
        user_id: userId,
        product_id: productId,
        rating,
        review_text: reviewText || null
      } as never)
      .select()
      .single()
    if (error) throw error
    return data as ProductRating
  }
}

export async function getUserRating(userId: string, productId: string): Promise<ProductRating | null> {
  const { data, error } = await supabase
    .from('product_ratings')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as ProductRating
}

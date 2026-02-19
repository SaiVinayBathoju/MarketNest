import { supabase } from '../lib/supabase'
import type { WishlistItem, Product } from '../types/database'

export interface WishlistItemWithProduct extends WishlistItem {
  products: Product
}

export async function fetchWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      products (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WishlistItemWithProduct[]
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  // Check if already exists to prevent duplicates
  const { data: existingRaw } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  const existing = existingRaw as { id: string } | null

  if (existing) {
    // Already exists, return the existing item
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('id', existing.id)
      .single()
    return data as WishlistItem
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    // Cast to `never` to satisfy Supabase generic when schema typing is out of sync
    .insert({
      user_id: userId,
      product_id: productId
    } as never)
    .select()
    .single()
  if (error) throw error
  return data as WishlistItem
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return false
    throw error
  }
  return !!data
}

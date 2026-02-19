import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchWishlistItems,
  addToWishlist as addToWishlistService,
  removeFromWishlist as removeFromWishlistService,
  isInWishlist as isInWishlistService,
  type WishlistItemWithProduct
} from '../services/wishlistService'
import type { Product } from '../types/database'

interface WishlistContextType {
  items: WishlistItemWithProduct[]
  loading: boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { session, isUser } = useAuth()
  const [items, setItems] = useState<WishlistItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadWishlist = useCallback(async () => {
    if (!session?.user?.id || !isUser) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      const wishlistItems = await fetchWishlistItems(session.user.id)
      setItems(wishlistItems)
    } catch (error) {
      console.error('Failed to load wishlist:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, isUser])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!session?.user?.id || !isUser) {
        throw new Error('You must be logged in as a user to add items to wishlist')
      }
      
      // Check if already in wishlist to prevent duplicates
      const alreadyInWishlist = items.some((item) => item.product_id === productId)
      if (alreadyInWishlist) {
        return // Already in wishlist, no need to add again
      }

      try {
        // Optimistic update: add to local state immediately
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()
        
        if (product) {
          const optimisticItem: WishlistItemWithProduct = {
            id: `temp-${Date.now()}`,
            user_id: session.user.id,
            product_id: productId,
            created_at: new Date().toISOString(),
            products: product as Product
          }
          setItems((prev) => [optimisticItem, ...prev])
        }

        await addToWishlistService(session.user.id, productId)
        await loadWishlist() // Refresh to get real data
      } catch (error) {
        // Rollback on error
        await loadWishlist()
        console.error('Failed to add to wishlist:', error)
        throw error
      }
    },
    [session?.user?.id, isUser, items, loadWishlist]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!session?.user?.id || !isUser) {
        throw new Error('You must be logged in as a user to remove items from wishlist')
      }
      
      // Optimistic update: remove from local state immediately
      const itemToRemove = items.find((item) => item.product_id === productId)
      setItems((prev) => prev.filter((item) => item.product_id !== productId))

      try {
        await removeFromWishlistService(session.user.id, productId)
        // Optionally refresh to ensure consistency
        await loadWishlist()
      } catch (error) {
        // Rollback on error
        if (itemToRemove) {
          setItems((prev) => [...prev, itemToRemove])
        }
        await loadWishlist()
        console.error('Failed to remove from wishlist:', error)
        throw error
      }
    },
    [session?.user?.id, isUser, items, loadWishlist]
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const isIn = items.some((item) => item.product_id === productId)
      if (isIn) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    },
    [items, addToWishlist, removeFromWishlist]
  )

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.product_id === productId)
    },
    [items]
  )

  const value: WishlistContextType = {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist: loadWishlist
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}

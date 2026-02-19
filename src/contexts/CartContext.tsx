import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchCartItems,
  addToCart as addToCartService,
  updateCartItemQuantity as updateCartItemQuantityService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  getCartItemCount,
  type CartItemWithProduct
} from '../services/cartService'

interface CartContextType {
  items: CartItemWithProduct[]
  loading: boolean
  itemCount: number
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session, isUser } = useAuth()
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [itemCount, setItemCount] = useState(0)

  const loadCart = useCallback(async () => {
    if (!session?.user?.id || !isUser) {
      setItems([])
      setItemCount(0)
      setLoading(false)
      return
    }

    try {
      const cartItems = await fetchCartItems(session.user.id)
      setItems(cartItems)
      const count = await getCartItemCount(session.user.id)
      setItemCount(count)
    } catch (error) {
      console.error('Failed to load cart:', error)
      setItems([])
      setItemCount(0)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, isUser])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!session?.user?.id || !isUser) {
        throw new Error('You must be logged in as a user to add items to cart')
      }
      try {
        await addToCartService(session.user.id, productId, quantity)
        await loadCart()
      } catch (error) {
        console.error('Failed to add to cart:', error)
        throw error
      }
    },
    [session?.user?.id, isUser, loadCart]
  )

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (!session?.user?.id || !isUser) {
        throw new Error('You must be logged in as a user to update cart')
      }
      try {
        await updateCartItemQuantityService(cartItemId, quantity)
        await loadCart()
      } catch (error) {
        console.error('Failed to update cart item:', error)
        throw error
      }
    },
    [session?.user?.id, isUser, loadCart]
  )

  const removeItem = useCallback(
    async (cartItemId: string) => {
      if (!session?.user?.id || !isUser) {
        throw new Error('You must be logged in as a user to remove items from cart')
      }
      try {
        await removeFromCartService(cartItemId)
        await loadCart()
      } catch (error) {
        console.error('Failed to remove cart item:', error)
        throw error
      }
    },
    [session?.user?.id, isUser, loadCart]
  )

  const clearCart = useCallback(async () => {
    if (!session?.user?.id || !isUser) {
      throw new Error('You must be logged in as a user to clear cart')
    }
    try {
      await clearCartService(session.user.id)
      await loadCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }, [session?.user?.id, isUser, loadCart])

  const value: CartContextType = {
    items,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: loadCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

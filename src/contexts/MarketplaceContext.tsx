import React, { createContext, useContext, useState, useCallback } from 'react'
import { fetchProducts } from '../services/productService'
import type { Product } from '../types/database'

const SCROLL_KEY = 'marketplace-scroll'

interface MarketplaceState {
  products: Product[]
  page: number
  hasMore: boolean
  category: string
  lastFetchedCategory: string | null
  loading: boolean
  loadingMore: boolean
  error: string
}

interface MarketplaceContextType extends MarketplaceState {
  setCategory: (category: string) => void
  loadPage: (pageNum: number, append: boolean) => Promise<void>
  saveScrollPosition: () => void
  getSavedScrollPosition: () => number
  clearScrollPosition: () => void
  hasCachedDataForCategory: (cat: string) => boolean
}

const initialState: MarketplaceState = {
  products: [],
  page: 1,
  hasMore: true,
  category: 'All',
  lastFetchedCategory: null,
  loading: false,
  loadingMore: false,
  error: ''
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null)

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketplaceState>(initialState)

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const category = state.category
      try {
        setState((s) => ({
          ...s,
          loading: pageNum === 1,
          loadingMore: pageNum > 1,
          error: ''
        }))
        const { products: list, hasMore: more } = await fetchProducts({
          page: pageNum,
          category: category === 'All' ? undefined : category
        })
        setState((s) => ({
          ...s,
          products: append ? [...s.products, ...list] : list,
          page: pageNum,
          hasMore: more,
          lastFetchedCategory: category,
          loading: false,
          loadingMore: false
        }))
      } catch (e) {
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: e instanceof Error ? e.message : 'Failed to load products'
        }))
      }
    },
    [state.category]
  )

  const setCategory = useCallback((category: string) => {
    setState((s) => ({ ...s, category, page: 1 }))
  }, [])

  const saveScrollPosition = useCallback(() => {
    try {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    } catch {
      // ignore
    }
  }, [])

  const getSavedScrollPosition = useCallback((): number => {
    try {
      const v = sessionStorage.getItem(SCROLL_KEY)
      return v ? Math.max(0, parseInt(v, 10)) : 0
    } catch {
      return 0
    }
  }, [])

  const clearScrollPosition = useCallback(() => {
    try {
      sessionStorage.removeItem(SCROLL_KEY)
    } catch {
      // ignore
    }
  }, [])

  const hasCachedDataForCategory = useCallback(
    (cat: string) => {
      return (
        state.products.length > 0 &&
        state.lastFetchedCategory === cat
      )
    },
    [state.products.length, state.lastFetchedCategory]
  )

  const value: MarketplaceContextType = {
    ...state,
    setCategory,
    loadPage,
    saveScrollPosition,
    getSavedScrollPosition,
    clearScrollPosition,
    hasCachedDataForCategory
  }

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return ctx
}

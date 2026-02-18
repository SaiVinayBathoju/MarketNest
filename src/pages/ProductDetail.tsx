import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductById } from '../services/productService'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [brandName, setBrandName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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
          <p className="text-3xl font-semibold text-gold-dark mt-6">
            ${product.price.toFixed(2)}
          </p>
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

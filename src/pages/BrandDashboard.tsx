import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchProducts, deleteProduct } from '../services/productService'
import type { Product } from '../types/database'

export function BrandDashboard() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.id) {
      loadProducts()
    } else {
      setLoading(false)
    }
  }, [profile?.id])

  async function loadProducts() {
    if (!profile?.id) return
    setLoading(true)
    setError('')
    try {
      const result = await Promise.race([
        fetchProducts({ brandId: profile.id }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        )
      ])
      setProducts(result.products)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeletingId(id)
    try {
      await deleteProduct(id)
      setProducts((p) => p.filter((x) => x.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <p className="text-gold-dark font-medium tracking-[0.15em] uppercase text-xs mb-1">
            Your Collection
          </p>
          <h1 className="text-4xl font-display font-medium text-ink">
            Brand Dashboard
          </h1>
        </div>
        <Link
          to="/brand/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all font-medium tracking-wide shadow-soft self-start sm:self-center"
        >
          <span className="text-lg">+</span> Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-sm bg-red-50/80 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-sand/30 rounded-sm">
          <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
          <p className="text-charcoal/70">Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-28 px-8 bg-gradient-to-b from-gold/5 to-transparent border border-gold/20 rounded-sm">
          <p className="text-2xl font-display font-medium text-ink mb-3">No products yet.</p>
          <p className="text-charcoal/70 mb-10 max-w-md mx-auto">
            Add your first product to showcase your collection and start selling.
          </p>
          <Link
            to="/brand/products/new"
            className="inline-flex items-center gap-2 px-10 py-4 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all font-medium tracking-wide shadow-card hover:shadow-elevated hover:-translate-y-0.5"
          >
            <span className="text-xl">+</span> Create your first product
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <article
              key={p.id}
              className="group bg-white overflow-hidden rounded-sm shadow-soft hover:shadow-card transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link to={`/products/${p.id}`} className="block aspect-[4/5] overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-5">
                <Link
                  to={`/products/${p.id}`}
                  className="font-medium text-ink hover:text-gold-dark transition-colors block mb-1"
                >
                  {p.name}
                </Link>
                {p.description && (
                  <p className="text-sm text-charcoal/70 line-clamp-2 mb-2">{p.description}</p>
                )}
                <p className="text-gold-dark font-semibold">${p.price.toFixed(2)}</p>
                <div className="mt-4 flex gap-4">
                  <Link
                    to={`/brand/products/edit/${p.id}`}
                    className="text-sm font-medium text-charcoal/80 hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-sm font-medium text-red-600/80 hover:text-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

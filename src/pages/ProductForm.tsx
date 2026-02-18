import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchProductById,
  createProduct,
  updateProduct
} from '../services/productService'
import { uploadProductImage, validateImageFile } from '../services/storageService'
import {
  validateRequired,
  validatePrice
} from '../utils/validation'

const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Bags', 'Jewelry', 'Other']

export function ProductForm() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit || !id || !profile?.id) return
    async function load() {
      setFetching(true)
      try {
        const p = await fetchProductById(id!)
        if (!p || !profile || p.brand_id !== profile.id) {
          navigate('/brand/dashboard')
          return
        }
        setName(p.name)
        setDescription(p.description)
        setPrice(String(p.price))
        setCategory(p.category || '')
        setImageUrl(p.image_url)
        setImagePreview(p.image_url)
      } catch {
        navigate('/brand/dashboard')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id, isEdit, profile?.id, navigate])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = validateImageFile(file)
    if (!result.valid) {
      setError(result.error || '')
      return
    }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id) return

    setError('')
    const nameErr = validateRequired(name, 'Product name')
    const descErr = validateRequired(description, 'Description')
    const priceErr = validatePrice(price)
    if (nameErr || descErr || priceErr) {
      setError(nameErr || descErr || priceErr || '')
      return
    }

    let finalImageUrl = imageUrl
    if (imageFile) {
      if (!profile.id) return
      try {
        finalImageUrl = await uploadProductImage(profile.id, imageFile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Image upload failed')
        return
      }
    }

    if (!finalImageUrl) {
      setError('Product image is required')
      return
    }

    setLoading(true)
    try {
      if (isEdit && id) {
        await updateProduct(id, {
          name,
          description,
          price: parseFloat(price),
          category: category || null,
          image_url: finalImageUrl
        })
        navigate('/brand/dashboard')
      } else {
        await createProduct({
          brand_id: profile.id,
          name,
          description,
          price: parseFloat(price),
          category: category || null,
          image_url: finalImageUrl
        })
        navigate('/brand/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
        <p className="text-charcoal/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-slide-up">
      <p className="text-gold-dark font-medium tracking-[0.15em] uppercase text-xs mb-2">
        {isEdit ? 'Edit' : 'Add New'}
      </p>
      <h1 className="text-4xl font-display font-medium text-ink mb-10">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-sm bg-red-50/80 text-red-700 border border-red-100 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
            placeholder="e.g. Classic Cotton Tee"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition resize-none"
            placeholder="Describe your product..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
            placeholder="29.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Product Image *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-36 h-36 object-cover rounded-sm border border-sand shadow-soft"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 text-xs px-3 py-1.5 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-36 h-36 border-2 border-dashed border-sand rounded-sm flex items-center justify-center text-charcoal/60 hover:border-gold/50 hover:text-charcoal transition-colors"
            >
              <span className="text-2xl">+</span> Upload
            </button>
          )}
          <p className="text-xs text-charcoal/60 mt-2">
            JPG, PNG or WebP. Max 2MB.
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all disabled:opacity-60 font-medium tracking-wide shadow-soft"
          >
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/brand/dashboard')}
            className="px-8 py-3 border border-sand rounded-sm hover:bg-sand/30 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

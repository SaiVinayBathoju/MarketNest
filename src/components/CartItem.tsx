import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import type { CartItemWithProduct } from '../services/cartService'
import { useState } from 'react'

interface CartItemProps {
  item: CartItemWithProduct
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)

  const product = item.products
  const subtotal = product.price * item.quantity

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    setUpdating(true)
    try {
      await updateQuantity(item.id, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert('Failed to update quantity. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remove this item from cart?')) return
    setRemoving(true)
    try {
      await removeItem(item.id)
    } catch (error) {
      console.error('Failed to remove item:', error)
      alert('Failed to remove item. Please try again.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex gap-4 p-4 bg-white rounded-sm shadow-soft border border-sand">
      <Link to={`/products/${product.id}`} className="flex-shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-sm"
        />
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/products/${product.id}`}
            className="font-medium text-ink hover:text-gold-dark transition-colors"
          >
            {product.name}
          </Link>
          {product.category && (
            <p className="text-xs text-charcoal/60 mt-1">{product.category}</p>
          )}
          <p className="text-gold-dark font-semibold mt-2">${product.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border border-charcoal/30 rounded-sm hover:border-ink disabled:opacity-50 transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={updating}
              className="w-8 h-8 flex items-center justify-center border border-charcoal/30 rounded-sm hover:border-ink disabled:opacity-50 transition-colors"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold text-ink">${subtotal.toFixed(2)}</p>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="text-sm text-red-600/80 hover:text-red-600 disabled:opacity-50 transition-colors"
            >
              {removing ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

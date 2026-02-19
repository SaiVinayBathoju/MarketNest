import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { CartItem } from '../components/CartItem'

export function Cart() {
  const { items, loading, clearCart } = useCart()

  const total = items.reduce((sum, item) => {
    return sum + item.products.price * item.quantity
  }, 0)

  const handleClearCart = async () => {
    if (!confirm('Clear all items from cart?')) return
    try {
      await clearCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      alert('Failed to clear cart. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
        <p className="text-charcoal/70">Loading cart...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-display font-medium text-ink mb-10">Shopping Cart</h1>
        <div className="text-center py-28 px-8 bg-sand/20 border border-sand rounded-sm">
          <p className="text-2xl font-display font-medium text-ink mb-3">Your cart is empty</p>
          <p className="text-charcoal/70 mb-8">Add some products to get started.</p>
          <Link
            to="/marketplace"
            className="inline-block px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-display font-medium text-ink">Shopping Cart</h1>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600/80 hover:text-red-600 transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="bg-white rounded-sm shadow-soft border border-sand p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-ink">Subtotal</span>
          <span className="text-2xl font-semibold text-ink">${total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between mb-6 text-sm text-charcoal/70">
          <span>Shipping & taxes calculated at checkout</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/marketplace"
            className="flex-1 px-6 py-3 border-2 border-charcoal/30 text-ink rounded-sm hover:border-ink hover:bg-ink/5 transition-all font-medium text-center"
          >
            Continue Shopping
          </Link>
          <Link
            to="/checkout"
            className="flex-1 px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium text-center"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

type PaymentMethod = 'card' | 'upi' | 'cod'

export function Checkout() {
  const { items, clearCart } = useCart()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')

  const subtotal = items.reduce((sum, item) => {
    return sum + item.products.price * item.quantity
  }, 0)

  const shipping = 10.0 // Mock shipping cost
  const tax = subtotal * 0.1 // Mock tax (10%)
  const total = subtotal + shipping + tax

  const handlePlaceOrder = async () => {
    if (!confirm('Place order? (This is a mock checkout)')) return

    setProcessing(true)
    try {
      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await clearCart()
      alert('Order placed successfully! (Mock checkout)')
      navigate('/marketplace')
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center py-28 px-8 bg-sand/20 border border-sand rounded-sm">
          <p className="text-2xl font-display font-medium text-ink mb-3">No items to checkout</p>
          <Link
            to="/cart"
            className="inline-block px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium mt-4"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-display font-medium text-ink mb-10">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-medium text-ink mb-4">Order Summary</h2>
          <div className="bg-white rounded-sm shadow-soft border border-sand p-6 space-y-4">
            {items.map((item) => {
              const product = item.products
              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-sand/50 last:border-0">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-sm"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-sm text-charcoal/70">Quantity: {item.quantity}</p>
                    <p className="text-gold-dark font-semibold mt-1">
                      ${(product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment & Shipping Info */}
        <div>
          <h2 className="text-xl font-medium text-ink mb-4">Payment & Shipping</h2>
          <div className="bg-white rounded-sm shadow-soft border border-sand p-6 space-y-4 mb-6">
            <div className="p-4 bg-sand/30 rounded-sm">
              <p className="text-sm text-charcoal/70 mb-2">
                This is a mock checkout. No payment will be processed.
              </p>
              <p className="text-sm text-charcoal/70">
                In a real application, you would integrate with a payment provider like Stripe,
                PayPal, or similar.
              </p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-ink mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-charcoal/30 rounded-sm cursor-pointer hover:border-ink transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-ink focus:ring-ink"
                  />
                  <span className="text-sm font-medium text-ink">Credit/Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-charcoal/30 rounded-sm cursor-pointer hover:border-ink transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-ink focus:ring-ink"
                  />
                  <span className="text-sm font-medium text-ink">UPI</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-charcoal/30 rounded-sm cursor-pointer hover:border-ink transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-ink focus:ring-ink"
                  />
                  <span className="text-sm font-medium text-ink">Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Payment Form Fields */}
            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-charcoal/30 rounded-sm focus:outline-none focus:border-ink"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-charcoal/30 rounded-sm focus:outline-none focus:border-ink"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-charcoal/30 rounded-sm focus:outline-none focus:border-ink"
                      disabled
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  className="w-full px-4 py-2 border border-charcoal/30 rounded-sm focus:outline-none focus:border-ink"
                  disabled
                />
                <p className="text-xs text-charcoal/60 mt-1">
                  Example: yourname@paytm, yourname@phonepe, etc.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-sm">
                <p className="text-sm text-blue-800">
                  Cash on Delivery: Pay when your order arrives. An additional handling fee may apply.
                </p>
              </div>
            )}
          </div>

          {/* Order Total */}
          <div className="bg-white rounded-sm shadow-soft border border-sand p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-charcoal/80">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal/80">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal/80">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-sand pt-3 flex justify-between text-lg font-semibold text-ink">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full px-6 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-colors font-medium disabled:opacity-50"
            >
              {processing
                ? 'Processing...'
                : paymentMethod === 'cod'
                  ? 'Place Order (Cash on Delivery)'
                  : 'Place Order'}
            </button>
            <Link
              to="/cart"
              className="block text-center mt-4 text-sm text-charcoal/70 hover:text-ink transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

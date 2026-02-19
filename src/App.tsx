import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MarketplaceProvider } from './contexts/MarketplaceContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Marketplace } from './pages/Marketplace'
import { ProductDetail } from './pages/ProductDetail'
import { BrandDashboard } from './pages/BrandDashboard'
import { ProductForm } from './pages/ProductForm'
import { Profile } from './pages/Profile'
import { Cart } from './pages/Cart'
import { Wishlist } from './pages/Wishlist'
import { Checkout } from './pages/Checkout'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <CartProvider>
          <WishlistProvider>
            <MarketplaceProvider>
              <Layout>
                <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false} guestOnly>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoute requireAuth={false} guestOnly>
                  <Signup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute requireRole="user">
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/dashboard"
              element={
                <ProtectedRoute requireRole="brand">
                  <BrandDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/products/new"
              element={
                <ProtectedRoute requireRole="brand">
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/products/edit/:id"
              element={
                <ProtectedRoute requireRole="brand">
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireRole="user">
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute requireRole="user">
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute requireRole="user">
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute requireRole="user">
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </MarketplaceProvider>
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MarketplaceProvider } from './contexts/MarketplaceContext'
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        </MarketplaceProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

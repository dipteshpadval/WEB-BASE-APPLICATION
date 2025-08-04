import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Dashboard from './pages/Dashboard'
import FileUpload from './pages/FileUpload'
import FileList from './pages/FileList'
import Admin from './pages/Admin'
import Login from './pages/Login'

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Create a client
const queryClient = new QueryClient()

// Test Component
function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">✅ Routing Test Page</h1>
        <p className="text-xl mb-4">If you see this, routing is working!</p>
        <p className="text-sm">URL: {window.location.href}</p>
        <p className="text-sm">Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

// Simple Loading Component
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🚀 App Loading...</h1>
        <p className="text-xl mb-4">React app is working!</p>
        <p className="text-sm">URL: {window.location.href}</p>
        <p className="text-sm">Time: {new Date().toLocaleString()}</p>
        <div className="mt-4">
          <a href="/test" className="text-blue-300 hover:text-blue-100 underline">Test Route</a>
          <span className="mx-2">|</span>
          <a href="/login" className="text-green-300 hover:text-green-100 underline">Login Page</a>
        </div>
      </div>
    </div>
  )
}

// Simple Home Page for Testing
function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🏠 Welcome to File Manager</h1>
        <p className="text-xl mb-4">React app is working correctly!</p>
        <p className="text-sm mb-4">URL: {window.location.href}</p>
        <p className="text-sm mb-6">Time: {new Date().toLocaleString()}</p>
        <div className="space-y-2">
          <a href="/test" className="block text-blue-300 hover:text-blue-100 underline">🧪 Test Route</a>
          <a href="/login" className="block text-green-300 hover:text-green-100 underline">🔐 Login Page</a>
          <a href="/admin" className="block text-purple-300 hover:text-purple-100 underline">👨‍💼 Admin Page</a>
        </div>
      </div>
    </div>
  )
}

// Debug Page
function DebugPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🐛 Debug Page</h1>
        <p className="text-xl mb-4">Deployment Test - If you see this, the app is deployed!</p>
        <p className="text-sm mb-4">URL: {window.location.href}</p>
        <p className="text-sm mb-6">Time: {new Date().toLocaleString()}</p>
        <div className="space-y-2">
          <a href="/home" className="block text-blue-300 hover:text-blue-100 underline">🏠 Home Page</a>
          <a href="/login" className="block text-green-300 hover:text-green-100 underline">🔐 Login Page</a>
          <a href="/test" className="block text-yellow-300 hover:text-yellow-100 underline">🧪 Test Route</a>
        </div>
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppContent() {
  console.log('🚀 AppContent rendered')
  console.log('📍 Current pathname:', window.location.pathname)
  
  return (
    <Router>
      <Routes>
        {/* Debug Route */}
        <Route path="/debug" element={<DebugPage />} />
        
        {/* Test Route */}
        <Route path="/test" element={<TestPage />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <FileUpload />
          </ProtectedRoute>
        } />
        <Route path="/files" element={
          <ProtectedRoute>
            <FileList />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  console.log('🚀 App component rendered')
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App 
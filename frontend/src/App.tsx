import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import FileUpload from './pages/FileUpload'
import FileList from './pages/FileList'
import Login from './pages/Login'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'
import Admin from './pages/Admin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<FileUpload />} />
                <Route path="/files" element={<FileList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Layout>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App 
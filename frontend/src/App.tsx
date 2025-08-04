import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FileList from './pages/FileList'
import FileUpload from './pages/FileUpload'
import Login from './pages/Login'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<FileList />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App 
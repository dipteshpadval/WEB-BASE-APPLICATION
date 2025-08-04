import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  FileText, 
  Upload, 
  BarChart3, 
  User,
  LogOut,
  Home
} from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Files', href: '/files', icon: FileText },
    { name: 'Upload', href: '/upload', icon: Upload },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-responsive">
          <div className="nav-container">
            {/* Logo and title */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">File Manager</span>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 touch-target"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
              
              {/* User menu */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">{user.email}</span>
                    <button
                      onClick={logout}
                      className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
                
                {/* Mobile user menu */}
                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-700">
                        {user.email}
                      </div>
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center w-full px-3 py-2 text-base text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-base text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      <User className="h-5 w-5 mr-3" />
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="container-responsive p-responsive">
        {children}
      </main>
    </div>
  )
} 
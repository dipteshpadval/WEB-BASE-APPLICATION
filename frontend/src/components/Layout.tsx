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
    <div className="min-h-screen animated-gradient">
      {/* Navigation with Glass Morphism */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and title with glow effect */}
            <div className="flex items-center">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-white icon-glow" />
              <span className="ml-3 text-xl sm:text-2xl font-bold text-white">
                File Manager
              </span>
            </div>
            
            {/* Mobile menu button with 3D effect */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-3 rounded-xl text-white hover:text-blue-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 touch-target transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop navigation with glass effect */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4 lg:space-x-6">
              <div className="flex space-x-2 lg:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2 icon-glow" />
                      <span className="hidden lg:inline">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
              
              {/* User menu with glass effect */}
              <div className="flex items-center space-x-3 lg:space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <span className="text-sm text-white/90 hidden md:inline">{user.email}</span>
                    <button
                      onClick={logout}
                      className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile navigation with glass effect */}
          {isMobileMenuOpen && (
            <div className="sm:hidden border-t border-white/20">
              <div className="pt-4 pb-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                      }`}
                    >
                      <Icon className="h-6 w-6 mr-4 icon-glow" />
                      {item.name}
                    </Link>
                  )
                })}
                
                {/* Mobile user menu */}
                <div className="pt-6 border-t border-white/20">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-4 py-2 text-sm text-white/70">
                        {user.email}
                      </div>
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-3 text-base text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300"
                      >
                        <LogOut className="h-6 w-6 mr-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-base text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      <User className="h-6 w-6 mr-4" />
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content with glass container */}
      <main className="container-responsive p-responsive">
        <div className="glass rounded-3xl p-responsive">
          {children}
        </div>
      </main>
    </div>
  )
} 
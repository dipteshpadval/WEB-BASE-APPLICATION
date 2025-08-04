import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  isActive: boolean
  lastLogin?: string
  filesUploaded?: number
  storageUsed?: string
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  adminLogin: (password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<void>
  getUsers: () => Promise<User[]>
  terminateUser: (userId: string) => Promise<void>
  activateUser: (userId: string) => Promise<void>
  getSystemStats: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default admin password
const DEFAULT_ADMIN_PASSWORD = '12345678'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is admin - only true if explicitly logged in as admin
  const isAdmin = user?.role === 'admin' && user?.id === 'admin'

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Only restore admin if they have the correct role and id
        if (parsedUser.role === 'admin' && parsedUser.id === 'admin') {
          setUser(parsedUser)
        } else {
          // Clear invalid admin data
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any email/password combination for regular users
      const newUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'user',
        isActive: true,
        lastLogin: new Date().toISOString(),
        filesUploaded: 0,
        storageUsed: '0 MB'
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const adminLogin = async (password: string) => {
    setIsLoading(true)
    try {
      // Check admin password
      const storedPassword = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PASSWORD
      
      if (password !== storedPassword) {
        throw new Error('Invalid admin password')
      }

      // Create admin user
      const adminUser: User = {
        id: 'admin',
        email: 'admin@certitude.com',
        name: 'Administrator',
        role: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString()
      }
      
      setUser(adminUser)
      localStorage.setItem('user', JSON.stringify(adminUser))
    } catch (error) {
      console.error('Admin login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const changeAdminPassword = async (oldPassword: string, newPassword: string) => {
    if (!isAdmin) {
      throw new Error('Only admins can change password')
    }

    const storedPassword = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PASSWORD
    
    if (oldPassword !== storedPassword) {
      throw new Error('Current password is incorrect')
    }

    localStorage.setItem('adminPassword', newPassword)
  }

  const getUsers = async (): Promise<User[]> => {
    if (!isAdmin) {
      throw new Error('Access denied')
    }

    // Get users from localStorage or return demo data
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      return JSON.parse(savedUsers)
    }

    // Demo users
    const demoUsers: User[] = [
      {
        id: '1',
        email: 'user1@certitude.com',
        name: 'John Doe',
        role: 'user',
        isActive: true,
        lastLogin: '2025-08-04T10:30:00Z',
        filesUploaded: 23,
        storageUsed: '800 MB'
      },
      {
        id: '2',
        email: 'user2@certitude.com',
        name: 'Jane Smith',
        role: 'user',
        isActive: true,
        lastLogin: '2025-08-04T09:15:00Z',
        filesUploaded: 12,
        storageUsed: '400 MB'
      },
      {
        id: '3',
        email: 'user3@certitude.com',
        name: 'Bob Johnson',
        role: 'user',
        isActive: false,
        lastLogin: '2025-08-03T16:45:00Z',
        filesUploaded: 8,
        storageUsed: '200 MB'
      }
    ]

    localStorage.setItem('users', JSON.stringify(demoUsers))
    return demoUsers
  }

  const terminateUser = async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Access denied')
    }

    const users = await getUsers()
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive: false } : user
    )
    
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const activateUser = async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Access denied')
    }

    const users = await getUsers()
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive: true } : user
    )
    
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const getSystemStats = async () => {
    if (!isAdmin) {
      throw new Error('Access denied')
    }

    // Get real stats from API
    try {
      const response = await fetch('https://web-base-application.onrender.com/api/files/stats')
      const stats = await response.json()
      
      const users = await getUsers()
      
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalFiles: stats.total_files || 0,
        totalStorage: stats.total_storage || '0 MB',
        fileTypeStats: stats.file_type_stats || {},
        clientCodeStats: stats.client_code_stats || {},
        assetTypeStats: stats.asset_type_stats || {}
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
      // Return fallback stats
      const users = await getUsers()
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalFiles: 0,
        totalStorage: '0 MB',
        fileTypeStats: {},
        clientCodeStats: {},
        assetTypeStats: {}
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      login,
      adminLogin,
      logout,
      isLoading,
      changeAdminPassword,
      getUsers,
      terminateUser,
      activateUser,
      getSystemStats
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
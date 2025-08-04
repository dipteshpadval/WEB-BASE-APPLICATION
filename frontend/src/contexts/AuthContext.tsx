import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  mobile: string
  employeeCode: string
  email?: string
  role: 'user' | 'admin'
  isActive: boolean
  isApproved: boolean
  lastLogin?: string
  filesUploaded?: number
  storageUsed?: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isAuthenticated: boolean
  register: (userData: { name: string; mobile: string; employeeCode: string }) => Promise<void>
  login: (employeeCode: string, password: string) => Promise<void>
  adminLogin: (password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<void>
  getUsers: () => Promise<User[]>
  approveUser: (userId: string) => Promise<void>
  rejectUser: (userId: string) => Promise<void>
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
  const isAuthenticated = !!user

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Only restore admin if they have the correct role and id
        if (parsedUser.role === 'admin' && parsedUser.id === 'admin') {
          setUser(parsedUser)
        } else if (parsedUser.role === 'user' && parsedUser.isApproved) {
          // Only restore approved users
          setUser(parsedUser)
        } else {
          // Clear invalid or unapproved user data
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const register = async (userData: { name: string; mobile: string; employeeCode: string }) => {
    setIsLoading(true)
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const existingUser = existingUsers.find((u: User) => 
        u.employeeCode === userData.employeeCode || u.mobile === userData.mobile
      )

      if (existingUser) {
        throw new Error('User with this employee code or mobile number already exists')
      }

      // Create new user (pending approval)
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        mobile: userData.mobile,
        employeeCode: userData.employeeCode,
        role: 'user',
        isActive: false,
        isApproved: false,
        createdAt: new Date().toISOString(),
        filesUploaded: 0,
        storageUsed: '0 MB'
      }

      // Save to users list
      existingUsers.push(newUser)
      localStorage.setItem('users', JSON.stringify(existingUsers))

      // Don't log in automatically - user needs admin approval
      toast.success('Registration successful! Please wait for admin approval.')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (employeeCode: string, password: string) => {
    setIsLoading(true)
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find((u: User) => u.employeeCode === employeeCode)

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.isApproved) {
        throw new Error('Your account is pending admin approval')
      }

      if (!user.isActive) {
        throw new Error('Your account has been terminated')
      }

      // For demo purposes, accept any password for approved users
      // In production, you'd verify against stored password hash
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      }

      // Update user in storage
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? updatedUser : u
      )
      localStorage.setItem('users', JSON.stringify(updatedUsers))

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Login error:', error)
      throw error
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
        name: 'Administrator',
        mobile: 'admin',
        employeeCode: 'ADMIN001',
        role: 'admin',
        isActive: true,
        isApproved: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
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

    // Get users from localStorage
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      return JSON.parse(savedUsers)
    }

    // Return empty array if no users
    return []
  }

  const approveUser = async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Access denied')
    }

    const users = await getUsers()
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            isApproved: true, 
            isActive: true,
            approvedBy: 'admin',
            approvedAt: new Date().toISOString()
          } 
        : user
    )
    
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const rejectUser = async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Access denied')
    }

    const users = await getUsers()
    const updatedUsers = users.filter(user => user.id !== userId)
    
    localStorage.setItem('users', JSON.stringify(updatedUsers))
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
        activeUsers: users.filter(u => u.isActive && u.isApproved).length,
        pendingUsers: users.filter(u => !u.isApproved).length,
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
        activeUsers: users.filter(u => u.isActive && u.isApproved).length,
        pendingUsers: users.filter(u => !u.isApproved).length,
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
      isAuthenticated,
      register,
      login,
      adminLogin,
      logout,
      isLoading,
      changeAdminPassword,
      getUsers,
      approveUser,
      rejectUser,
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
import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../lib/api'

interface User {
  employeeCode: string
  name: string
  mobile: string
  role: string
  status: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isAuthenticated: boolean
  register: (userData: { name: string; mobile: string; employeeCode: string; password: string }) => Promise<void>
  login: (employeeCode: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  getUsers: () => Promise<User[]>
  approveUser: (employeeCode: string) => Promise<void>
  rejectUser: (employeeCode: string) => Promise<void>
  terminateUser: (employeeCode: string) => Promise<void>
  activateUser: (employeeCode: string) => Promise<void>
  getSystemStats: () => Promise<any>
  getSystemLogs: () => Promise<any>
  getFileDownloads: () => Promise<any>
  updateUser: (employeeCode: string, userData: { name?: string; mobile?: string; password?: string; status?: string }) => Promise<void>
  deleteUser: (employeeCode: string) => Promise<void>
  getUserStats: () => Promise<any>
  updateProfile: (profileData: { employeeCode: string; name?: string; mobile?: string; currentPassword?: string; newPassword?: string }) => Promise<any>
  getOptions: () => Promise<any>
  addOption: (type: string, value: string) => Promise<any>
  deleteOption: (type: string, value: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true

  // Check if user is admin
  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user
  
  // Debug logging for authentication state
  useEffect(() => {
    console.log('🔐 AuthContext state changed:', {
      user: user?.employeeCode,
      role: user?.role,
      status: user?.status,
      isAuthenticated,
      isAdmin
    })
  }, [user, isAuthenticated, isAdmin])

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('🔄 Loading user from localStorage:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    } else {
      console.log('🔄 No saved user found in localStorage')
    }
    // Set loading to false after initial load
    setIsLoading(false)
  }, [])

  const register = async (userData: { name: string; mobile: string; employeeCode: string; password: string }) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register(userData.name, userData.mobile, userData.employeeCode, userData.password)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.error || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (employeeCode: string, password: string) => {
    console.log('🔐 AuthContext login called with:', { employeeCode, password: '***' })
    setIsLoading(true)
    try {
      console.log('📡 Making API call to auth/login...')
      const response = await authAPI.login(employeeCode, password)
      console.log('✅ API response received:', response)
      
      // Ensure the user object has all required fields
      const userData = {
        employeeCode: response.user.employeeCode,
        name: response.user.name,
        mobile: response.user.mobile || '',
        role: response.user.role,
        status: response.user.status,
        createdAt: response.user.createdAt || new Date().toISOString()
      }
      
      console.log('👤 Setting user state:', userData)
      setUser(userData)
      
      console.log('💾 Saving user and token to localStorage...')
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', response.token)
      
      console.log('✅ Login process completed successfully')
      toast.success(response.message)
    } catch (error: any) {
      console.error('❌ AuthContext login error:', error)
      console.error('❌ Error response:', error.response?.data)
      toast.error(error.response?.data?.error || 'Login failed')
      throw error
    } finally {
      console.log('🏁 Setting loading to false')
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
  }

  const getUsers = async (): Promise<User[]> => {
    try {
      const response = await authAPI.getUsers()
      return response.users
    } catch (error: any) {
      console.error('Get users error:', error)
      toast.error('Failed to fetch users')
      return []
    }
  }

  const approveUser = async (employeeCode: string) => {
    try {
      const response = await authAPI.approveUser(employeeCode)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Approve user error:', error)
      toast.error(error.response?.data?.error || 'Failed to approve user')
      throw error
    }
  }

  const rejectUser = async (employeeCode: string) => {
    try {
      const response = await authAPI.rejectUser(employeeCode)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Reject user error:', error)
      toast.error(error.response?.data?.error || 'Failed to reject user')
      throw error
    }
  }

  const terminateUser = async (employeeCode: string) => {
    try {
      const response = await authAPI.terminateUser(employeeCode)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Terminate user error:', error)
      toast.error(error.response?.data?.error || 'Failed to terminate user')
      throw error
    }
  }

  const activateUser = async (employeeCode: string) => {
    try {
      const response = await authAPI.activateUser(employeeCode)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Activate user error:', error)
      toast.error(error.response?.data?.error || 'Failed to activate user')
      throw error
    }
  }

  const getSystemStats = async () => {
    try {
      const stats = await authAPI.getStats()
      return stats
    } catch (error: any) {
      console.error('Get stats error:', error)
      toast.error('Failed to fetch system stats')
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        terminatedUsers: 0,
        adminUsers: 0
      }
    }
  }

  const getSystemLogs = async () => {
    try {
      const logs = await authAPI.getLogs()
      return logs
    } catch (error: any) {
      console.error('Get system logs error:', error)
      toast.error('Failed to fetch system logs')
      return { logs: [] }
    }
  }

  const getFileDownloads = async () => {
    try {
      const downloads = await authAPI.getDownloads()
      return downloads
    } catch (error: any) {
      console.error('Get file downloads error:', error)
      toast.error('Failed to fetch file downloads')
      return { downloads: [] }
    }
  }

  const updateUser = async (employeeCode: string, userData: { name?: string; mobile?: string; password?: string; status?: string }) => {
    try {
      const response = await authAPI.updateUser(employeeCode, userData)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Update user error:', error)
      toast.error(error.response?.data?.error || 'Failed to update user')
      throw error
    }
  }

  const deleteUser = async (employeeCode: string) => {
    try {
      const response = await authAPI.deleteUser(employeeCode)
      toast.success(response.message)
    } catch (error: any) {
      console.error('Delete user error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete user')
      throw error
    }
  }

  const getUserStats = async () => {
    try {
      const stats = await authAPI.getUserStats()
      return stats
    } catch (error: any) {
      console.error('Get user stats error:', error)
      toast.error('Failed to fetch user stats')
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        terminatedUsers: 0,
        adminUsers: 0
      }
    }
  }

  const updateProfile = async (profileData: { employeeCode: string; name?: string; mobile?: string; currentPassword?: string; newPassword?: string }) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      setUser(response.user)
      toast.success(response.message)
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
      throw error
    }
  }

  const getOptions = async () => {
    try {
      const response = await authAPI.getOptions()
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to get options')
      throw error
    }
  }

  const addOption = async (type: string, value: string) => {
    try {
      const response = await authAPI.addOption(type, value)
      toast.success(response.message)
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add option')
      throw error
    }
  }

  const deleteOption = async (type: string, value: string) => {
    try {
      const response = await authAPI.deleteOption(type, value)
      toast.success(response.message)
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete option')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAdmin,
    isAuthenticated,
    register,
    login,
    logout,
    isLoading,
    getUsers,
    approveUser,
    rejectUser,
    terminateUser,
    activateUser,
    getSystemStats,
    getSystemLogs,
    getFileDownloads,
    updateUser,
    deleteUser,
    getUserStats,
    updateProfile,
    getOptions,
    addOption,
    deleteOption
  }

  return (
    <AuthContext.Provider value={value}>
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
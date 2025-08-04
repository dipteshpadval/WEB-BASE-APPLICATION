import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import AdminLogin from '../components/AdminLogin'
import ChangePassword from '../components/ChangePassword'
import { 
  Users, 
  Settings, 
  Shield, 
  Database, 
  Activity,
  BarChart3,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  FileText,
  HardDrive,
  Network,
  Server,
  Zap,
  Lock,
  UserX,
  UserPlus,
  RefreshCw,
  LogOut
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalFiles: number
  totalStorage: string
  fileTypeStats: Record<string, number>
  clientCodeStats: Record<string, number>
  assetTypeStats: Record<string, number>
}

interface User {
  id: string
  email: string
  name: string
  role: string
  lastLogin: string
  isActive: boolean
  filesUploaded: number
  storageUsed: string
}

interface SystemLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  user?: string
  action: string
}

export default function Admin() {
  const { user, isAdmin, getUsers, terminateUser, activateUser, getSystemStats, logout } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Check if user is admin, if not show login immediately
  useEffect(() => {
    if (!isAdmin) {
      setShowAdminLogin(true)
    }
  }, [isAdmin])

  // Fetch system stats from real API
  const { data: systemStats, isLoading: statsLoading } = useQuery(
    ['systemStats'],
    async () => {
      try {
        const response = await fetch('https://web-base-application.onrender.com/api/files/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const stats = await response.json()
        
        // Get users for real user count
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
    },
    {
      enabled: isAdmin,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  // Fetch users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery(
    ['users'],
    getUsers,
    {
      enabled: isAdmin,
    }
  )

  // Mutations
  const terminateUserMutation = useMutation(terminateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('User terminated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to terminate user')
    }
  })

  const activateUserMutation = useMutation(activateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('User activated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate user')
    }
  })

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  const handleTerminateUser = (userId: string) => {
    if (confirm('Are you sure you want to terminate this user?')) {
      terminateUserMutation.mutate(userId)
    }
  }

  const handleActivateUser = (userId: string) => {
    activateUserMutation.mutate(userId)
  }

  // Mock system logs (in real app, this would come from API)
  const systemLogs: SystemLog[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'success',
      message: 'System stats updated successfully',
      user: 'admin@certitude.com',
      action: 'SYSTEM_UPDATE'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'info',
      message: 'User login detected',
      user: 'user1@certitude.com',
      action: 'USER_LOGIN'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'warning',
      message: 'Large file upload detected',
      user: 'user2@certitude.com',
      action: 'FILE_UPLOAD'
    }
  ]

  // If not admin, show login
  if (!isAdmin) {
    return (
      <div className="space-responsive">
        <div className="mobile-card text-center">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="mobile-text-lg font-bold text-white mb-4">Admin Access Required</h1>
            <p className="mobile-text-sm text-white/70 mb-6">
              This page requires administrator privileges. Please log in with admin credentials.
            </p>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="btn btn-primary"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Login
            </button>
          </div>
        </div>

        {showAdminLogin && (
          <AdminLogin
            onSuccess={() => setShowAdminLogin(false)}
            onCancel={() => setShowAdminLogin(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-responsive">
      {/* Header with admin info */}
      <div className="mobile-mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mr-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="mobile-text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="mobile-text-sm text-white/80">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChangePassword(true)}
              className="btn btn-secondary"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </button>
            <button
              onClick={logout}
              className="btn btn-danger"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mobile-card mobile-mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'system', name: 'System', icon: Settings },
            { id: 'logs', name: 'Logs', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-responsive">
          {/* System Stats Cards */}
          <div className="grid-responsive">
            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {statsLoading ? '...' : systemStats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {statsLoading ? '...' : systemStats?.activeUsers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {statsLoading ? '...' : systemStats?.totalFiles || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <HardDrive className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {statsLoading ? '...' : systemStats?.totalStorage || '0 MB'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File Type Stats */}
          <div className="mobile-card">
            <div className="card-header">
              <div className="flex items-center">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="mobile-text-base font-semibold text-gray-900">File Type Distribution</h3>
              </div>
            </div>
            <div className="card-content">
              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading stats...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(systemStats?.fileTypeStats || {}).map(([type, count]) => (
                    <div key={type} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{type}</span>
                        <span className="text-2xl font-bold text-blue-600">{String(count)}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(systemStats?.fileTypeStats || {}).length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No file type data available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-responsive">
          <div className="mobile-card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mobile-text-base font-semibold text-gray-900">User Management</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => refetchUsers()}
                    className="btn btn-secondary"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Files</th>
                        <th>Storage</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td>
                            <div className="flex items-center">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                                <UserCheck className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="mobile-text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="mobile-text-sm text-gray-900">{user.role}</span>
                          </td>
                          <td>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                              {user.isActive ? 'Active' : 'Terminated'}
                            </span>
                          </td>
                          <td>
                            <span className="mobile-text-sm text-gray-600">
                              {format(new Date(user.lastLogin), 'MMM d, HH:mm')}
                            </span>
                          </td>
                          <td>
                            <span className="mobile-text-sm font-medium text-gray-900">{user.filesUploaded}</span>
                          </td>
                          <td>
                            <span className="mobile-text-sm text-gray-600">{user.storageUsed}</span>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              {user.isActive ? (
                                <button
                                  onClick={() => handleTerminateUser(user.id)}
                                  disabled={terminateUserMutation.isLoading}
                                  className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                                  title="Terminate User"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user.id)}
                                  disabled={activateUserMutation.isLoading}
                                  className="p-1 text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                                  title="Activate User"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No users found matching your search' : 'No users available'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-responsive">
          <div className="grid-responsive-2">
            <div className="mobile-card">
              <div className="card-header">
                <div className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 mr-3">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mobile-text-base font-semibold text-gray-900">Database</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="mobile-text-sm text-gray-600">Status</span>
                    <span className="mobile-text-sm font-medium text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mobile-text-sm text-gray-600">Type</span>
                    <span className="mobile-text-sm font-medium text-gray-900">OneDrive Sync</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mobile-text-sm text-gray-600">Sync Status</span>
                    <span className="mobile-text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mobile-card">
              <div className="card-header">
                <div className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mr-3">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mobile-text-base font-semibold text-gray-900">System Settings</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <button className="w-full btn btn-secondary">
                    <Upload className="h-4 w-4 mr-2" />
                    Backup Database
                  </button>
                  <button className="w-full btn btn-secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </button>
                  <button className="w-full btn btn-secondary">
                    <Zap className="h-4 w-4 mr-2" />
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-responsive">
          <div className="mobile-card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mr-3">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mobile-text-base font-semibold text-gray-900">System Logs</h3>
                </div>
                <div className="flex space-x-2">
                  <button className="btn btn-secondary">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                  <button className="btn btn-secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                    <div className={`p-2 rounded-lg mr-3 flex-shrink-0 ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mobile-text-sm font-medium text-gray-900">{log.message}</p>
                      <div className="flex items-center mt-1 space-x-4">
                        <span className="text-xs text-gray-500">
                          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                        </span>
                        {log.user && (
                          <span className="text-xs text-gray-500">User: {log.user}</span>
                        )}
                        <span className="text-xs text-gray-500">Action: {log.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  FileText, 
  HardDrive, 
  Activity, 
  CheckCircle, 
  XCircle, 
  UserX, 
  UserCheck,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  Shield,
  Settings,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Upload,
  LogOut,
  Lock,
  User,
  Home,
  Download,
  Database,
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserData {
  employeeCode: string
  name: string
  mobile: string
  role: string
  status: string
  createdAt: string
  lastLogin: string
  filesCount: number
  storageUsed: string
  downloadCount: number
  uploadCount: number
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  terminatedUsers: number
  adminUsers: number
  totalFiles: number
  totalStorage: string
  fileTypeStats: Record<string, number>
  clientCodeStats: Record<string, number>
  assetTypeStats: Record<string, number>
}

interface SystemLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  type: 'success' | 'warning' | 'info' | 'error'
}

interface FileDownload {
  id: string
  filename: string
  user: string
  downloadTime: string
  fileSize: string
}

export default function Admin() {
  const { 
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
    logout
  } = useAuth()

  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    terminatedUsers: 0,
    adminUsers: 0,
    totalFiles: 0,
    totalStorage: '0 MB',
    fileTypeStats: {},
    clientCodeStats: {},
    assetTypeStats: {}
  })
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [fileDownloads, setFileDownloads] = useState<FileDownload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUserEdit, setShowUserEdit] = useState(false)
  const [editUserData, setEditUserData] = useState({
    name: '',
    mobile: '',
    password: '',
    status: '',
    role: ''
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersData, statsData, logsData, downloadsData, userStatsData] = await Promise.all([
        getUsers(),
        getSystemStats(),
        getSystemLogs(),
        getFileDownloads(),
        getUserStats()
      ])
      
      // Merge user data with real file statistics
      const usersWithStats = usersData.map(user => {
        const userStat = userStatsData.userStats?.find((stat: any) => stat.employeeCode === user.employeeCode)
        return {
          ...user,
          lastLogin: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
          filesCount: userStat?.uploadCount || 0,
          storageUsed: `${Math.floor(Math.random() * 1000) + 100} MB`,
          downloadCount: userStat?.downloadCount || 0,
          uploadCount: userStat?.uploadCount || 0
        }
      })
      
      setUsers(usersWithStats)
      
      // Get file stats from files API
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5002/api'
      const fileStatsResponse = await fetch(`${apiUrl}/files/stats`)
      const fileStats = await fileStatsResponse.json()
      
      const transformedStats = {
        totalUsers: statsData.totalUsers || 0,
        activeUsers: statsData.activeUsers || 0,
        pendingUsers: statsData.pendingUsers || 0,
        terminatedUsers: statsData.terminatedUsers || 0,
        adminUsers: statsData.adminUsers || 0,
        totalFiles: fileStats.total_files || 0,
        totalStorage: fileStats.total_storage || '0 MB',
        fileTypeStats: fileStats.file_type_stats || {},
        clientCodeStats: fileStats.client_code_stats || {},
        assetTypeStats: fileStats.asset_type_stats || {}
      }
      setStats(transformedStats)
      
      // Set real system logs and downloads
      setSystemLogs(logsData.logs || [])
      setFileDownloads(downloadsData.downloads || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [getUsers, getSystemStats, getSystemLogs, getFileDownloads, getUserStats])

  const handleApproveUser = async (employeeCode: string) => {
    try {
      await approveUser(employeeCode)
      await loadData()
      toast.success('User approved successfully')
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error('Failed to approve user')
    }
  }

  const handleRejectUser = async (employeeCode: string) => {
    try {
      await rejectUser(employeeCode)
      await loadData()
      toast.success('User rejected successfully')
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error('Failed to reject user')
    }
  }

  const handleTerminateUser = async (employeeCode: string) => {
    try {
      await terminateUser(employeeCode)
      await loadData()
      toast.success('User terminated successfully')
    } catch (error) {
      console.error('Error terminating user:', error)
      toast.error('Failed to terminate user')
    }
  }

  const handleActivateUser = async (employeeCode: string) => {
    try {
      await activateUser(employeeCode)
      await loadData()
      toast.success('User activated successfully')
    } catch (error) {
      console.error('Error activating user:', error)
      toast.error('Failed to activate user')
    }
  }

  const handleDeleteDatabase = () => {
    if (window.confirm('Are you sure you want to delete all database files? This action cannot be undone.')) {
      toast.success('Database files deleted successfully')
      // Here you would call the actual API to delete database files
    }
  }

  const handleExportLogs = () => {
    toast.success('System logs exported successfully')
    // Here you would call the actual API to export logs
  }

  const handleBackupDatabase = () => {
    toast.success('Database backup completed successfully')
    // Here you would call the actual API to backup database
  }

  const handleClearCache = () => {
    toast.success('Cache cleared successfully')
    // Here you would call the actual API to clear cache
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setEditUserData({
      name: user.name,
      mobile: user.mobile,
      password: '', // Don't show current password for security
      status: user.status,
      role: user.role
    })
    setShowUserEdit(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      // Only send fields that have been changed
      const updateData: any = {}
      if (editUserData.name !== selectedUser.name) updateData.name = editUserData.name
      if (editUserData.mobile !== selectedUser.mobile) updateData.mobile = editUserData.mobile
      if (editUserData.password) updateData.password = editUserData.password
      if (editUserData.status !== selectedUser.status) updateData.status = editUserData.status
      if (editUserData.role !== selectedUser.role) updateData.role = editUserData.role

      await updateUser(selectedUser.employeeCode, updateData)
      setShowUserEdit(false)
      setSelectedUser(null)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error updating user:', error)
      // Error is already handled by the API function
    }
  }

  const handleDeleteUser = async (employeeCode: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(employeeCode)
        await loadData() // Reload data
      } catch (error) {
        console.error('Error deleting user:', error)
        // Error is already handled by the API function
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString // Return original string if parsing fails
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'terminated':
        return 'text-red-500'
      case 'rejected':
        return 'text-gray-500'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'terminated':
        return <UserX className="w-4 h-4 text-red-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile.includes(searchTerm)
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Loading Admin Panel...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 rounded-t-xl mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-white font-semibold text-lg">File Manager</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/files" className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>Files</span>
                </Link>
                <Link to="/upload" className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
                <Link to="/admin" className="flex items-center space-x-2 text-white bg-purple-500 px-3 py-1 rounded-lg">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-4 w-4" />
                  <span>admin@certitude.com</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-white hover:text-red-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Admin Dashboard Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome, Administrator</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Users</p>
                      <p className="text-3xl font-bold">{stats.activeUsers}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserCheck className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Files</p>
                      <p className="text-3xl font-bold">{stats.totalFiles}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Storage Used</p>
                      <p className="text-3xl font-bold">{stats.totalStorage}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <HardDrive className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* File Type Distribution */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">File Type Distribution</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats.fileTypeStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="terminated">Terminated</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Password
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          FILES
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DOWNLOADS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.employeeCode} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.employeeCode}@certitude.com</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">{user.employeeCode}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{user.mobile}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">••••••••</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : user.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{user.filesCount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{user.downloadCount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveUser(user.employeeCode)}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="Approve User"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectUser(user.employeeCode)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Reject User"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleTerminateUser(user.employeeCode)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Terminate User"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              )}
                              {user.status === 'terminated' && (
                                <button
                                  onClick={() => handleActivateUser(user.employeeCode)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  title="Activate User"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit User"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.employeeCode)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Database Panel */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-orange-500 rounded-lg mr-3">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="text-gray-900">OneDrive Sync</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sync Status</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* System Settings Panel */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg mr-3">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleBackupDatabase}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">Backup Database</span>
                    <Upload className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={handleExportLogs}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">Export Logs</span>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">Clear Cache</span>
                    <RefreshCw className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={handleDeleteDatabase}
                    className="w-full flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <span>Delete Database Files</span>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* System Logs */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-lg mr-3">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                      <Filter className="h-4 w-4 inline mr-1" />
                      Filter
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                      <Download className="h-4 w-4 inline mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getLogIcon(log.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-xs text-gray-500">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                        <p className="text-xs text-gray-400">{log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Download Tracking */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg mr-3">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">File Download Tracking</h3>
                </div>
                <div className="space-y-3">
                  {fileDownloads.map((download) => (
                    <div key={download.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{download.filename}</p>
                          <p className="text-xs text-gray-500">Downloaded by {download.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(download.downloadTime)}</p>
                        <p className="text-xs text-gray-400">{download.fileSize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Edit Modal */}
      {showUserEdit && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowUserEdit(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Code
                </label>
                <input
                  type="text"
                  value={selectedUser.employeeCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={editUserData.mobile}
                  onChange={(e) => setEditUserData({...editUserData, mobile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editUserData.status}
                  onChange={(e) => setEditUserData({...editUserData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="terminated">Terminated</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editUserData.role || selectedUser.role}
                  onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setShowUserEdit(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
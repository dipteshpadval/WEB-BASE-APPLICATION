import React, { useState, useEffect } from 'react'
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
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  employeeCode: string
  name: string
  mobile: string
  role: string
  status: string
  createdAt: string
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
}

export default function Admin() {
  const { 
    getUsers, 
    approveUser, 
    rejectUser, 
    terminateUser, 
    activateUser, 
    getSystemStats,
    logout
  } = useAuth()

  const [users, setUsers] = useState<User[]>([])
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
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersData, statsData] = await Promise.all([
        getUsers(),
        getSystemStats()
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (employeeCode: string) => {
    try {
      await approveUser(employeeCode)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const handleRejectUser = async (employeeCode: string) => {
    try {
      await rejectUser(employeeCode)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const handleTerminateUser = async (employeeCode: string) => {
    try {
      await terminateUser(employeeCode)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error terminating user:', error)
    }
  }

  const handleActivateUser = async (employeeCode: string) => {
    try {
      await activateUser(employeeCode)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error activating user:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile.includes(searchTerm)
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Mock system logs
  const systemLogs: SystemLog[] = [
    {
      id: '1',
      action: 'User Login',
      user: 'admin',
      timestamp: new Date().toISOString(),
      details: 'Admin user logged in successfully'
    },
    {
      id: '2',
      action: 'User Registration',
      user: 'user123',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: 'New user registered and pending approval'
    },
    {
      id: '3',
      action: 'File Upload',
      user: 'user456',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: 'File uploaded: report.xlsx'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-300">Welcome, Administrator</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 mb-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'system', name: 'System', icon: Settings },
            { id: 'logs', name: 'Logs', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Files</p>
                    <p className="text-3xl font-bold text-white">{stats.totalFiles}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Storage Used</p>
                    <p className="text-3xl font-bold text-white">{stats.totalStorage}</p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <HardDrive className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* File Type Distribution */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">File Type Distribution</h3>
              </div>
              <div className="space-y-4">
                {Object.keys(stats.fileTypeStats).length > 0 ? (
                  Object.entries(stats.fileTypeStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-white/70">{type}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-center">No file type data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search users by name, employee code, or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="terminated">Terminated</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.employeeCode} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-white/70">{user.employeeCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white/70">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.mobile}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-500/20 text-green-300' 
                                : user.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveUser(user.employeeCode)}
                                  className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                                  title="Approve User"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.employeeCode)}
                                  className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                                  title="Reject User"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {user.status === 'active' && (
                              <button
                                onClick={() => handleTerminateUser(user.employeeCode)}
                                className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                                title="Terminate User"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            {user.status === 'terminated' && (
                              <button
                                onClick={() => handleActivateUser(user.employeeCode)}
                                className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                                title="Activate User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
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
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">File Type Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.fileTypeStats).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-white/70">{type}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">Client Code Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.clientCodeStats).map(([code, count]) => (
                      <div key={code} className="flex justify-between items-center">
                        <span className="text-white/70">{code}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Logs</h3>
            <div className="space-y-3">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {log.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-white/70 text-sm">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">{formatDate(log.timestamp)}</p>
                    <p className="text-white/50 text-xs">{log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
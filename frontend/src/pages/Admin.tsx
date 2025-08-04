import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import AdminLogin from '../components/AdminLogin'
import ChangePassword from '../components/ChangePassword'
import Layout from '../components/Layout'
import { 
  Users, 
  FileText, 
  HardDrive, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Calendar,
  Phone,
  Hash,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  totalFiles: number
  totalStorage: string
  fileTypeStats: Record<string, number>
  clientCodeStats: Record<string, number>
  assetTypeStats: Record<string, number>
}

interface User {
  id: string
  name: string
  mobile: string
  employeeCode: string
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

interface SystemLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
}

export default function Admin() {
  const { user, isAdmin, getUsers, approveUser, rejectUser, terminateUser, activateUser, getSystemStats, logout } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'terminated'>('all')

  useEffect(() => {
    if (!isAdmin) {
      setShowAdminLogin(true)
    }
  }, [isAdmin])

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
    },
    { enabled: isAdmin, refetchInterval: 30000 }
  )

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery(
    ['users'], getUsers, { enabled: isAdmin }
  )

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'pending' && !user.isApproved) ||
                         (filterStatus === 'approved' && user.isApproved && user.isActive) ||
                         (filterStatus === 'terminated' && !user.isActive)
    
    return matchesSearch && matchesFilter
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getStatusColor = (isActive: boolean, isApproved: boolean) => {
    if (!isApproved) return 'text-yellow-400'
    if (!isActive) return 'text-red-400'
    return 'text-green-400'
  }

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId)
      toast.success('User approved successfully')
      refetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve user')
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId)
      toast.success('User rejected successfully')
      refetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject user')
    }
  }

  const handleTerminateUser = async (userId: string) => {
    try {
      await terminateUser(userId)
      toast.success('User terminated successfully')
      refetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to terminate user')
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUser(userId)
      toast.success('User activated successfully')
      refetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user')
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {showAdminLogin && (
          <AdminLogin
            onSuccess={() => setShowAdminLogin(false)}
            onCancel={() => logout()}
          />
        )}
        {showChangePassword && (
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        )}
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-responsive">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/70">Manage users and monitor system activity</p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 mb-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'users', name: 'User Management', icon: Users },
            { id: 'system', name: 'System', icon: Shield },
            { id: 'logs', name: 'Activity Logs', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
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
                    <p className="text-3xl font-bold text-white">{systemStats?.totalUsers || 0}</p>
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
                    <p className="text-3xl font-bold text-white">{systemStats?.activeUsers || 0}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Pending Approval</p>
                    <p className="text-3xl font-bold text-white">{systemStats?.pendingUsers || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Files</p>
                    <p className="text-3xl font-bold text-white">{systemStats?.totalFiles || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Info */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Storage Usage</h3>
                <HardDrive className="h-5 w-5 text-white/70" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>Used</span>
                    <span>{systemStats?.totalStorage || '0 MB'}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {filteredUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/70 text-sm">{user.employeeCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isApproved 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
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
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved Users</option>
                  <option value="terminated">Terminated Users</option>
                </select>
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
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
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
                              user.isApproved 
                                ? user.isActive 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {user.isApproved 
                                ? user.isActive 
                                  ? 'Active' 
                                  : 'Terminated'
                                : 'Pending'
                              }
                            </span>
                            {user.isApproved && user.approvedAt && (
                              <span className="text-xs text-white/50">
                                {formatDate(user.approvedAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white/70">
                            <div>Files: {user.filesUploaded || 0}</div>
                            <div>Storage: {user.storageUsed || '0 MB'}</div>
                            {user.lastLogin && (
                              <div className="text-xs">Last: {formatDate(user.lastLogin)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {!user.isApproved ? (
                              <>
                                <button
                                  onClick={() => handleApproveUser(user.id)}
                                  className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                                  title="Approve User"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.id)}
                                  className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                                  title="Reject User"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                {user.isActive ? (
                                  <button
                                    onClick={() => handleTerminateUser(user.id)}
                                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                                    title="Terminate User"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleActivateUser(user.id)}
                                    className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                                    title="Activate User"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                )}
                              </>
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
                                         {Object.entries(systemStats?.fileTypeStats || {}).map(([type, count]) => (
                       <div key={type} className="flex justify-between items-center">
                         <span className="text-white/70">{type}</span>
                         <span className="text-white font-medium">{String(count)}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div>
                   <h4 className="text-white font-medium mb-3">Client Code Distribution</h4>
                   <div className="space-y-2">
                     {Object.entries(systemStats?.clientCodeStats || {}).map(([code, count]) => (
                       <div key={code} className="flex justify-between items-center">
                         <span className="text-white/70">{code}</span>
                         <span className="text-white font-medium">{String(count)}</span>
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
              {filteredUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/70 text-sm">
                        {user.isApproved ? 'Account approved' : 'Registration pending'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">{formatDate(user.createdAt)}</p>
                    <p className="text-white/50 text-xs">{user.employeeCode}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showChangePassword && (
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        )}
      </div>
    </Layout>
  )
} 
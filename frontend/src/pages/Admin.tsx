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
}

export default function Admin() {
  const { 
    getUsers, 
    approveUser, 
    rejectUser, 
    terminateUser, 
    activateUser, 
    getSystemStats 
  } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    terminatedUsers: 0,
    adminUsers: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage users and monitor system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card-3d p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card-3d p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="card-3d p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Pending Users</p>
                <p className="text-2xl font-bold text-white">{stats.pendingUsers}</p>
              </div>
            </div>
          </div>

          <div className="card-3d p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Terminated Users</p>
                <p className="text-2xl font-bold text-white">{stats.terminatedUsers}</p>
              </div>
            </div>
          </div>

          <div className="card-3d p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Admin Users</p>
                <p className="text-2xl font-bold text-white">{stats.adminUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card-3d p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
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
        </div>

        {/* Users List */}
        <div className="card-3d p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              User Management
            </h2>
            <p className="text-gray-400">{filteredUsers.length} users found</p>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.employeeCode} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{user.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>ID: {user.employeeCode}</span>
                        <span>•</span>
                        <span>{user.mobile}</span>
                        <span>•</span>
                        <span className="capitalize">{user.role}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(user.status)}
                          <span className={getStatusColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined: {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveUser(user.employeeCode)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.employeeCode)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}

                    {user.status === 'active' && (
                      <button
                        onClick={() => handleTerminateUser(user.employeeCode)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <UserX className="w-3 h-3" />
                        Terminate
                      </button>
                    )}

                    {user.status === 'terminated' && (
                      <button
                        onClick={() => handleActivateUser(user.employeeCode)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
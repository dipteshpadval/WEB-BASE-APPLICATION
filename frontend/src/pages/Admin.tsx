import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { filesAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
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
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface SystemStats {
  totalUsers: number
  totalFiles: number
  totalStorage: string
  activeSessions: number
  systemUptime: string
  lastBackup: string
  diskUsage: number
  memoryUsage: number
  cpuUsage: number
}

interface User {
  id: string
  email: string
  name: string
  role: string
  lastLogin: string
  status: 'active' | 'inactive' | 'suspended'
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
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Mock data for demonstration
  const systemStats: SystemStats = {
    totalUsers: 12,
    totalFiles: 156,
    totalStorage: '2.4 GB',
    activeSessions: 8,
    systemUptime: '15 days, 8 hours',
    lastBackup: '2025-08-04 14:30:00',
    diskUsage: 67,
    memoryUsage: 45,
    cpuUsage: 23
  }

  const users: User[] = [
    {
      id: '1',
      email: 'admin@certitude.com',
      name: 'Admin User',
      role: 'Administrator',
      lastLogin: '2025-08-04 15:30:00',
      status: 'active',
      filesUploaded: 45,
      storageUsed: '1.2 GB'
    },
    {
      id: '2',
      email: 'user1@certitude.com',
      name: 'John Doe',
      role: 'User',
      lastLogin: '2025-08-04 14:20:00',
      status: 'active',
      filesUploaded: 23,
      storageUsed: '800 MB'
    },
    {
      id: '3',
      email: 'user2@certitude.com',
      name: 'Jane Smith',
      role: 'User',
      lastLogin: '2025-08-03 16:45:00',
      status: 'inactive',
      filesUploaded: 12,
      storageUsed: '400 MB'
    }
  ]

  const systemLogs: SystemLog[] = [
    {
      id: '1',
      timestamp: '2025-08-04 15:30:00',
      level: 'success',
      message: 'File uploaded successfully',
      user: 'user1@certitude.com',
      action: 'FILE_UPLOAD'
    },
    {
      id: '2',
      timestamp: '2025-08-04 15:25:00',
      level: 'info',
      message: 'User logged in',
      user: 'admin@certitude.com',
      action: 'USER_LOGIN'
    },
    {
      id: '3',
      timestamp: '2025-08-04 15:20:00',
      level: 'warning',
      message: 'Large file upload detected',
      user: 'user2@certitude.com',
      action: 'FILE_UPLOAD'
    },
    {
      id: '4',
      timestamp: '2025-08-04 15:15:00',
      level: 'error',
      message: 'Database connection timeout',
      action: 'SYSTEM_ERROR'
    }
  ]

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-responsive">
      {/* Header with enhanced styling */}
      <div className="mobile-mb-6">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mr-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="mobile-text-lg font-bold text-white">Admin Dashboard</h1>
            <p className="mobile-text-sm text-white/80">System administration and monitoring</p>
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
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
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
                    {systemStats.totalUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {systemStats.totalFiles}
                  </p>
                </div>
              </div>
            </div>

            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <HardDrive className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {systemStats.totalStorage}
                  </p>
                </div>
              </div>
            </div>

            <div className="mobile-stats-card group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Network className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="mobile-text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {systemStats.activeSessions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="grid-responsive-2">
            <div className="mobile-card">
              <div className="card-header">
                <div className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mobile-text-base font-semibold text-gray-900">System Performance</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="mobile-text-sm font-medium text-gray-700">CPU Usage</span>
                      <span className="mobile-text-sm font-bold text-gray-900">{systemStats.cpuUsage}%</span>
                    </div>
                    <div className="progress-3d">
                      <div className="progress-fill" style={{ width: `${systemStats.cpuUsage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="mobile-text-sm font-medium text-gray-700">Memory Usage</span>
                      <span className="mobile-text-sm font-bold text-gray-900">{systemStats.memoryUsage}%</span>
                    </div>
                    <div className="progress-3d">
                      <div className="progress-fill" style={{ width: `${systemStats.memoryUsage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="mobile-text-sm font-medium text-gray-700">Disk Usage</span>
                      <span className="mobile-text-sm font-bold text-gray-900">{systemStats.diskUsage}%</span>
                    </div>
                    <div className="progress-3d">
                      <div className="progress-fill" style={{ width: `${systemStats.diskUsage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mobile-card">
              <div className="card-header">
                <div className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mr-3">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mobile-text-base font-semibold text-gray-900">System Info</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="mobile-text-sm text-gray-600">Uptime</span>
                    <span className="mobile-text-sm font-medium text-gray-900">{systemStats.systemUptime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mobile-text-sm text-gray-600">Last Backup</span>
                    <span className="mobile-text-sm font-medium text-gray-900">
                      {format(new Date(systemStats.lastBackup), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mobile-text-sm text-gray-600">Database</span>
                    <span className="mobile-text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
              </div>
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
                <button className="btn btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>
            <div className="card-content">
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
                    {users.map((user) => (
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
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
                            <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:text-green-800 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800 transition-colors">
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
    </div>
  )
} 
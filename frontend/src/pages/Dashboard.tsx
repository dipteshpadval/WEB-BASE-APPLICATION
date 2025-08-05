import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import type { FileStats, File } from '../lib/api'
import { filesAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Upload, 
  Download, 
  Users, 
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Home,
  Shield,
  LogOut,
  User
} from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user, logout } = useAuth()
  
  const { data: stats, isLoading: statsLoading } = useQuery<FileStats>('fileStats', filesAPI.getStats)
  const { data: recentFiles, isLoading: filesLoading } = useQuery<{ files: File[] }>('recentFiles', () => 
    filesAPI.getAll({ limit: 5 })
  )

  const isLoading = statsLoading || filesLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-8 bg-white/20 rounded-2xl w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
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
              <Link to="/admin" className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors">
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
              <div className="flex items-center space-x-2 text-white">
                <User className="h-4 w-4" />
                <span>{user?.name || 'admin@certitude.com'}</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Welcome back, {user?.name || 'admin@certitude.com'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-xl mr-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_files || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl mr-4">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">File Types</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats?.file_type_stats || stats?.file_types || {}).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-xl mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Client Codes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats?.client_code_stats || stats?.client_codes || {}).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Asset Types</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats?.asset_type_stats || stats?.asset_types || {}).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-xl mr-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">File Type Distribution</p>
                <div className="mt-2">
                  {Object.keys(stats?.file_type_stats || stats?.file_types || {}).length > 0 ? (
                    <p className="text-lg font-bold text-gray-900">
                      {Object.keys(stats?.file_type_stats || stats?.file_types || {}).length} types
                    </p>
                  ) : (
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No files uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl mr-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <div className="mt-2">
                  {recentFiles?.files && recentFiles.files.length > 0 ? (
                    <p className="text-lg font-bold text-gray-900">
                      {recentFiles.files.length} recent files
                    </p>
                  ) : (
                    <div className="text-center">
                      <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No recent files</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
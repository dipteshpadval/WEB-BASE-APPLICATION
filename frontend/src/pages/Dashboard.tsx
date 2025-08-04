import React from 'react'
import { useQuery } from 'react-query'
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
  Zap
} from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  
  const { data: stats, isLoading: statsLoading } = useQuery<FileStats>('fileStats', filesAPI.getStats)
  const { data: recentFiles, isLoading: filesLoading } = useQuery<{ files: File[] }>('recentFiles', () => 
    filesAPI.getAll({ limit: 5 })
  )

  const isLoading = statsLoading || filesLoading

  if (isLoading) {
    return (
      <div className="animate-pulse space-responsive">
        <div className="h-8 sm:h-10 bg-white/20 rounded-2xl w-1/3 sm:w-1/4 mb-6 sm:mb-8"></div>
        <div className="mobile-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mobile-stats-card">
              <div className="h-4 sm:h-5 bg-white/20 rounded-lg w-3/4 mb-4 sm:mb-5"></div>
              <div className="h-8 sm:h-10 bg-white/20 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-responsive">
      {/* Header with gradient text */}
      <div className="mobile-mb-6">
        <h1 className="text-responsive-lg font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="mobile-text-sm text-white/80">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Cards with 3D effects */}
      <div className="mobile-stats-grid mobile-mb-6">
        <div className="mobile-stats-card group">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <div className="ml-4 sm:ml-5">
              <p className="mobile-text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {stats?.total_files || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-stats-card group">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <div className="ml-4 sm:ml-5">
              <p className="mobile-text-sm font-medium text-gray-600">File Types</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {Object.keys(stats?.file_type_stats || stats?.file_types || {}).length}
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-stats-card group">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <div className="ml-4 sm:ml-5">
              <p className="mobile-text-sm font-medium text-gray-600">Client Codes</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {Object.keys(stats?.client_code_stats || stats?.client_codes || {}).length}
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-stats-card group">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <div className="ml-4 sm:ml-5">
              <p className="mobile-text-sm font-medium text-gray-600">Asset Types</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {Object.keys(stats?.asset_type_stats || stats?.asset_types || {}).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity with enhanced styling */}
      <div className="grid-responsive-2 mobile-mb-6">
        {/* File Type Distribution with 3D progress bars */}
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
            {(stats?.file_type_stats && Object.keys(stats.file_type_stats).length > 0) || 
             (stats?.file_types && Object.keys(stats.file_types).length > 0) ? (
              <div className="space-y-4 sm:space-y-5">
                {Object.entries(stats?.file_type_stats || stats?.file_types || {}).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="mobile-text-sm font-medium text-gray-700 truncate mr-3 flex-1">{type}</span>
                      <span className="mobile-text-sm font-bold text-gray-900">{count as number}</span>
                    </div>
                    <div className="progress-3d">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${((count as number) / stats.total_files) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mobile-text-sm">No files uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity with enhanced styling */}
        <div className="mobile-card">
          <div className="card-header">
            <div className="flex items-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mr-3">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="mobile-text-base font-semibold text-gray-900">Recent Activity</h3>
            </div>
          </div>
          <div className="card-content">
            {recentFiles?.files && recentFiles.files.length > 0 ? (
              <div className="space-y-4 sm:space-y-5">
                {recentFiles.files.map((file: any) => (
                  <div key={file.id} className="flex items-start justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                    <div className="flex items-start min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mr-3 flex-shrink-0">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mobile-text-sm font-semibold text-gray-900 truncate">{file.filename}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {file.file_type} • {file.client_code}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          File Date: {file.file_date ? format(new Date(file.file_date), 'MMM d, yyyy') : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-3">
                      {format(new Date(file.uploaded_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mobile-text-sm">No recent files</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Uploads Chart with enhanced styling */}
      <div className="mobile-card">
        <div className="card-header">
          <div className="flex items-center">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mr-3">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="mobile-text-base font-semibold text-gray-900">Monthly Uploads</h3>
          </div>
        </div>
        <div className="card-content">
          {stats?.monthly_stats && Object.keys(stats.monthly_stats).length > 0 ? (
            <div className="space-y-4 sm:space-y-5">
              {Object.entries(stats.monthly_stats)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-indigo-50 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mr-3">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <span className="mobile-text-sm font-medium text-gray-700">
                        {format(new Date(month + '-01'), 'MMMM yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mobile-text-sm font-bold text-gray-900 mr-2">{count as number}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((count as number) * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mobile-text-sm">No upload data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
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
  BarChart3
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
        <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4 sm:mb-6"></div>
        <div className="mobile-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mobile-stats-card">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-responsive">
      {/* Header */}
      <div className="mobile-mb-4">
        <h1 className="mobile-text-lg font-bold text-gray-900">Dashboard</h1>
        <p className="mobile-text-sm text-gray-600 mt-1">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="mobile-stats-grid mobile-mb-4">
        <div className="mobile-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="mobile-text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                {stats?.total_files || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="mobile-text-sm font-medium text-gray-600">File Types</p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                {Object.keys(stats?.file_type_stats || stats?.file_types || {}).length}
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="mobile-text-sm font-medium text-gray-600">Client Codes</p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                {Object.keys(stats?.client_code_stats || stats?.client_codes || {}).length}
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="mobile-text-sm font-medium text-gray-600">Asset Types</p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                {Object.keys(stats?.asset_type_stats || stats?.asset_types || {}).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid-responsive-2 mobile-mb-4">
        {/* File Type Distribution */}
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="mobile-text-base font-semibold text-gray-900">File Type Distribution</h3>
          </div>
          <div className="card-content">
            {(stats?.file_type_stats && Object.keys(stats.file_type_stats).length > 0) || 
             (stats?.file_types && Object.keys(stats.file_types).length > 0) ? (
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(stats?.file_type_stats || stats?.file_types || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="mobile-text-sm text-gray-600 truncate mr-2 flex-1">{type}</span>
                    <div className="flex items-center flex-shrink-0">
                      <div className="w-12 sm:w-16 md:w-32 bg-gray-200 rounded-full h-2 mr-2 sm:mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${((count as number) / stats.total_files) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="mobile-text-sm font-medium text-gray-900">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 mobile-text-sm">No files uploaded yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="mobile-text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-content">
            {recentFiles?.files && recentFiles.files.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentFiles.files.map((file: any) => (
                  <div key={file.id} className="flex items-start justify-between py-2">
                    <div className="flex items-start min-w-0 flex-1">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="mobile-text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {file.file_type} • {file.client_code}
                        </p>
                        <p className="text-xs text-gray-400">
                          File Date: {file.file_date ? format(new Date(file.file_date), 'MMM d, yyyy') : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {format(new Date(file.uploaded_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 mobile-text-sm">No recent files</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Uploads Chart */}
      <div className="mobile-card">
        <div className="card-header">
          <h3 className="mobile-text-base font-semibold text-gray-900">Monthly Uploads</h3>
        </div>
        <div className="card-content">
          {stats?.monthly_stats && Object.keys(stats.monthly_stats).length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(stats.monthly_stats)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2" />
                      <span className="mobile-text-sm text-gray-600">
                        {format(new Date(month + '-01'), 'MMMM yyyy')}
                      </span>
                    </div>
                    <span className="mobile-text-sm font-medium text-gray-900">{count as number}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 mobile-text-sm">No upload data available</p>
          )}
        </div>
      </div>
    </div>
  )
} 
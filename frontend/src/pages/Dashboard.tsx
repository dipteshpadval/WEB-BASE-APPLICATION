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
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.total_files || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">File Types</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats?.file_type_stats || {}).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Client Codes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats?.client_code_stats || {}).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Asset Types</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats?.asset_type_stats || {}).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">File Type Distribution</h3>
          </div>
          <div className="card-content">
            {stats?.file_type_stats && Object.keys(stats.file_type_stats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.file_type_stats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{type}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${((count as number) / stats.total_files) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-content">
            {recentFiles?.files && recentFiles.files.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {file.file_type} • {file.client_code}
                        </p>
                        <p className="text-xs text-gray-400">
                          File Date: {file.file_date ? format(new Date(file.file_date), 'MMM d, yyyy') : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(file.uploaded_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent files</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Uploads Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Uploads</h3>
        </div>
        <div className="card-content">
          {stats?.monthly_stats && Object.keys(stats.monthly_stats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.monthly_stats)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(month + '-01'), 'MMMM yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${((count as number) / Math.max(...Object.values(stats.monthly_stats).map(v => v as number))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count as number}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upload data available</p>
          )}
        </div>
      </div>
    </div>
  )
} 
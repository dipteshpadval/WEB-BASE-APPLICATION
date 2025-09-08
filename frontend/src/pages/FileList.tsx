import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { filesAPI, type File } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2,
  Calendar,
  Home,
  Upload,
  Shield,
  LogOut,
  User,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function FileList() {
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    fileDateFrom: '',
    fileDateTo: '',
    fileType: 'All File Types',
    assetType: '',
    clientCode: 'All Client Codes'
  })

  const { data: filesData, isLoading, refetch } = useQuery(
    ['files', searchTerm, filters],
    () => filesAPI.getAll({ search: searchTerm })
  )

  const files = filesData?.files || []

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const blob = await filesAPI.download(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await filesAPI.delete(fileId)
        toast.success('File deleted successfully')
        refetch()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete file')
      }
    }
  }

  const handleBulkDownload = async (mode: 'merge' | 'zip') => {
    try {
      // Map UI filters to API filters
      const params: any = {}
      if (filters.assetType) params.assetType = filters.assetType
      if (filters.clientCode && filters.clientCode !== 'All Client Codes') params.clientCode = filters.clientCode
      if (filters.fileDateFrom) params.startDate = filters.fileDateFrom
      if (filters.fileDateTo) params.endDate = filters.fileDateTo
      // The UI "File Type" here is extension filter; backend expects logical file_type so we omit
      params.mode = mode

      const blob = await filesAPI.bulkDownload(params)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mode === 'zip' ? 'files.zip' : 'files_consolidated.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Bulk download started')
    } catch (error: any) {
      console.error('Bulk download error:', error)
      toast.error(error.response?.data?.error || 'Failed to prepare bulk download')
    }
  }

  const clearFilters = () => {
    setFilters({
      fileDateFrom: '',
      fileDateTo: '',
      fileType: 'All File Types',
      assetType: '',
      clientCode: 'All Client Codes'
    })
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
              <Link to="/files" className="flex items-center space-x-2 text-white bg-purple-500 px-3 py-1 rounded-lg">
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
          <h1 className="text-4xl font-bold text-white mb-2">File Management</h1>
          <p className="text-white/80">Browse and download your uploaded files</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              Today's Files
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              This Week's Files
            </button>
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => handleBulkDownload('merge')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Download merged Excel"
              >
                Download Consolidated (.xlsx)
              </button>
              <button
                onClick={() => handleBulkDownload('zip')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Download as separate files (ZIP)"
              >
                Download ZIP
              </button>
            </div>
          </div>

          {/* Detailed Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Date From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.fileDateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, fileDateFrom: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Date To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.fileDateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, fileDateTo: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
              <select
                value={filters.fileType}
                onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All File Types</option>
                <option>.xlsx</option>
                <option>.xls</option>
                <option>.xlsm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
              <input
                type="text"
                placeholder="Filter by asset type"
                value={filters.assetType}
                onChange={(e) => setFilters(prev => ({ ...prev, assetType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Code</label>
              <select
                value={filters.clientCode}
                onChange={(e) => setFilters(prev => ({ ...prev, clientCode: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All Client Codes</option>
                <option>CLIENT001</option>
                <option>CLIENT002</option>
                <option>CLIENT003</option>
              </select>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Files ({files.length})</h2>
            {isLoading && <span className="text-gray-500">Loading...</span>}
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No files found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file: File) => (
                <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{file.filename}</h3>
                      <p className="text-sm text-gray-500">
                        {file.file_type} • {file.client_code} • {file.asset_type}
                      </p>
                      <p className="text-xs text-gray-400">
                        File Date: {file.file_date ? format(new Date(file.file_date), 'MMM d, yyyy') : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
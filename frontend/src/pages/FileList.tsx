import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { filesAPI } from '../lib/api'
import { Download, Search, Filter, Calendar, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { getClientCodes } from '../lib/clientCodes'
import toast from 'react-hot-toast'

export default function FileList() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    fileType: '',
    assetType: '',
    clientCode: '',
    search: '',
    page: 1
  })

  const [showFilters, setShowFilters] = useState(false)
  const clientCodes = getClientCodes()

  const { data: filesData, isLoading } = useQuery(
    ['files', filters],
    () => filesAPI.getAll(filters),
    { keepPreviousData: true }
  )

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      fileType: '',
      assetType: '',
      clientCode: '',
      search: '',
      page: 1
    })
  }

  const downloadFile = async (fileId: string, filename: string) => {
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
      toast.success('File downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const quickFilter = (type: 'today' | 'week') => {
    const today = new Date()
    const startDate = type === 'today' 
      ? today.toISOString().split('T')[0]
      : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate: today.toISOString().split('T')[0],
      page: 1
    }))
  }

  return (
    <div className="space-responsive">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-responsive-lg font-bold text-gray-900">File Management</h1>
        <p className="text-responsive-sm text-gray-600 mt-1">Browse and download your uploaded files</p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6 sm:mb-8">
        <div className="card-content">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle for Mobile */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary w-full touch-target"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => quickFilter('today')}
                className="btn btn-secondary text-xs touch-target"
              >
                Today's Files
              </button>
              <button
                onClick={() => quickFilter('week')}
                className="btn btn-secondary text-xs touch-target"
              >
                This Week's Files
              </button>
              <button
                onClick={clearFilters}
                className="btn btn-secondary text-xs touch-target"
              >
                Clear Filters
              </button>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
                  File Date From
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input"
                  title="Filter files by file date from this date"
                />
              </div>
              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
                  File Date To
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input"
                  title="Filter files by file date until this date"
                />
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
                  File Type
                </label>
                <select
                  value={filters.fileType}
                  onChange={(e) => handleFilterChange('fileType', e.target.value)}
                  className="input"
                >
                  <option value="">All File Types</option>
                  <option value="Holding">Holding</option>
                  <option value="Offsite">Offsite</option>
                  <option value="Client Query">Client Query</option>
                  <option value="Value Price">Value Price</option>
                  <option value="Report">Report</option>
                  <option value="Analysis">Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
                  Asset Type
                </label>
                <input
                  type="text"
                  value={filters.assetType}
                  onChange={(e) => handleFilterChange('assetType', e.target.value)}
                  className="input"
                  placeholder="Filter by asset type"
                />
              </div>

              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
                  Client Code
                </label>
                <select
                  value={filters.clientCode}
                  onChange={(e) => handleFilterChange('clientCode', e.target.value)}
                  className="input"
                >
                  <option value="">All Client Codes</option>
                  {clientCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-responsive-md font-semibold text-gray-900">
              Files ({filesData?.total || 0})
            </h2>
            {isLoading && (
              <div className="text-responsive-sm text-gray-500">Loading...</div>
            )}
          </div>
        </div>
        <div className="card-content">
          {filesData?.files && filesData.files.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>File</th>
                    <th className="hidden sm:table-cell">Type</th>
                    <th className="hidden lg:table-cell">Asset</th>
                    <th className="hidden md:table-cell">Client</th>
                    <th className="hidden lg:table-cell">File Date</th>
                    <th className="hidden md:table-cell">Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filesData.files.map((file: any) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-responsive-sm font-medium text-gray-900 truncate">
                              {file.filename}
                            </p>
                            <p className="text-xs text-gray-500 sm:hidden">
                              {file.file_type} • {file.client_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="text-responsive-sm text-gray-900">{file.file_type}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-responsive-sm text-gray-900">{file.asset_type}</span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-responsive-sm text-gray-900">{file.client_code}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-responsive-sm text-gray-900">
                          {file.file_date ? format(new Date(file.file_date), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-responsive-sm text-gray-500">
                          {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => downloadFile(file.id, file.filename)}
                          className="btn btn-primary text-xs touch-target"
                          title="Download file"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-responsive-sm text-gray-500">
                {isLoading ? 'Loading files...' : 'No files found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
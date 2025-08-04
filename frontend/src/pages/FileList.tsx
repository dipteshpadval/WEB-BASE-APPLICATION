import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { filesAPI } from '../lib/api'
import { Download, Search, Filter, Calendar, FileText, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getClientCodes } from '../lib/clientCodes'

interface FilterState {
  startDate: string
  endDate: string
  fileType: string
  assetType: string
  clientCode: string
  search: string
  page: number
}

const FileList: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    fileType: '',
    assetType: '',
    clientCode: '',
    search: '',
    page: 1,
  })

  const { data, isLoading, refetch } = useQuery(
    ['files', filters],
    () => filesAPI.getAll(filters),
    { keepPreviousData: true }
  )

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const blob = await filesAPI.download(fileId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDownloadMultiple = async () => {
    if (!data?.files || data.files.length === 0) {
      toast.error('No files to download')
      return
    }

    try {
      toast.loading('Preparing download...')
      
      // Create a zip file with all filtered files
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      const downloadPromises = data.files.map(async (file) => {
        try {
          const blob = await filesAPI.download(file.id)
          const folderName = `${file.client_code}/${file.asset_type}`
          zip.file(`${folderName}/${file.filename}`, blob)
        } catch (error) {
          console.error(`Failed to download ${file.filename}:`, error)
        }
      })

      await Promise.all(downloadPromises)
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `files_${format(new Date(), 'yyyy-MM-dd')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success('Files downloaded successfully')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download files')
      console.error('Download error:', error)
    }
  }

  const updateFilter = (field: keyof FilterState, value: string | number) => {
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
      page: 1,
    })
  }

  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0]
    setFilters(prev => ({
      ...prev,
      startDate: today,
      endDate: today,
      page: 1
    }))
  }

  const setThisWeekFilter = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
    
    setFilters(prev => ({
      ...prev,
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
      page: 1
    }))
  }

  const fileTypes = ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis']
  const assetTypes = ['Equity', 'Fixed Income', 'Real Estate', 'Commodities', 'Cash', 'Other']
  const clientCodes = getClientCodes()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
        <p className="text-gray-600">Browse, filter, and download files</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Date From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="input"
                title="Filter files by file date from this date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Date To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="input"
                title="Filter files by file date until this date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={filters.fileType}
                onChange={(e) => updateFilter('fileType', e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                {fileTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
              <select
                value={filters.assetType}
                onChange={(e) => updateFilter('assetType', e.target.value)}
                className="input"
              >
                <option value="">All Assets</option>
                {assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Code</label>
              <select
                value={filters.clientCode}
                onChange={(e) => updateFilter('clientCode', e.target.value)}
                className="input"
              >
                <option value="">All Clients</option>
                {clientCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={setTodayFilter}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Today's Files
            </button>
            <button
              onClick={setThisWeekFilter}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              This Week's Files
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
            >
              Clear Filters
            </button>
            
            {data?.files && data.files.length > 0 && (
              <button
                onClick={handleDownloadMultiple}
                className="btn btn-primary btn-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download All ({data.files.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Files</h3>
            {data && (
              <p className="text-sm text-gray-600">
                Showing {data.files?.length || 0} of {data.total || 0} files
              </p>
            )}
          </div>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : data?.files && data.files.length > 0 ? (
            <div className="space-y-4">
              {data.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{file.filename}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{file.file_type}</span>
                        <span>•</span>
                        <span>{file.asset_type}</span>
                        <span>•</span>
                        <span>{file.client_code}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            File Date: {file.file_date ? format(new Date(file.file_date), 'MMM d, yyyy') : 'Not specified'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            Uploaded: {format(new Date(file.uploaded_at), 'MMM d, yyyy \'at\' h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No files found matching your criteria</p>
            </div>
          )}

          {/* Pagination */}
          {data?.total && data.total > 10 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {filters.page} of {Math.ceil(data.total / 10)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page >= Math.ceil(data.total / 10)}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileList 
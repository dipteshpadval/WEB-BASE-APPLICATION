import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from 'react-query'
import { filesAPI } from '../lib/api'
import { Upload, X, FileText, CheckCircle, AlertCircle, Cloud, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClientCodes } from '../lib/clientCodes'

interface FileWithMetadata {
  file: File
  fileType: string
  assetType: string
  clientCode: string
  fileDate: string
  id: string
}

export default function FileUpload() {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const queryClient = useQueryClient()
  const clientCodes = getClientCodes()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    const newFiles: FileWithMetadata[] = acceptedFiles.map(file => ({
      file,
      fileType: '',
      assetType: '',
      clientCode: '',
      fileDate: today,
      id: Math.random().toString(36).substr(2, 9)
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm']
    }
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileMetadata = (id: string, field: keyof FileWithMetadata, value: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const uploadMutation = useMutation(
    async (fileData: FileWithMetadata) => {
      console.log('📤 Uploading file with metadata:', {
        filename: fileData.file.name,
        fileType: fileData.fileType,
        assetType: fileData.assetType,
        clientCode: fileData.clientCode,
        fileDate: fileData.fileDate
      })
      
      return await filesAPI.upload(fileData.file, {
        fileType: fileData.fileType,
        assetType: fileData.assetType,
        clientCode: fileData.clientCode,
        fileDate: fileData.fileDate
      })
    },
    {
      onSuccess: (data, fileData) => {
        console.log('✅ File uploaded successfully:', data)
        toast.success(`${fileData.file.name} uploaded successfully!`)
        queryClient.invalidateQueries(['fileStats'])
        queryClient.invalidateQueries(['recentFiles'])
        queryClient.invalidateQueries(['files'])
      },
      onError: (error: any, fileData) => {
        console.error('❌ Upload failed:', error)
        const errorMessage = error.response?.data?.error || 'Upload failed'
        toast.error(`${fileData.file.name}: ${errorMessage}`)
      }
    }
  )

  const uploadFile = (fileData: FileWithMetadata) => {
    if (!fileData.fileType || !fileData.assetType || !fileData.clientCode || !fileData.fileDate) {
      toast.error('Please fill in all required fields')
      return
    }
    uploadMutation.mutate(fileData)
  }

  const uploadAllFiles = () => {
    const incompleteFiles = files.filter(f => !f.fileType || !f.assetType || !f.clientCode || !f.fileDate)
    if (incompleteFiles.length > 0) {
      toast.error('Please fill in all required fields for all files')
      return
    }
    
    files.forEach(fileData => {
      uploadMutation.mutate(fileData)
    })
  }

  return (
    <div className="space-responsive">
      {/* Header with enhanced styling */}
      <div className="mobile-mb-6">
        <div className="flex items-center mb-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mr-4">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="mobile-text-lg font-bold text-white">Upload Files</h1>
            <p className="mobile-text-sm text-white/80">Upload Excel files with metadata</p>
          </div>
        </div>
      </div>

      {/* Enhanced Drop Zone with 3D effects */}
      <div className="mobile-card mobile-mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all duration-500 ${
            isDragActive
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-2xl scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br from-gray-50 to-blue-50 hover:shadow-xl'
          }`}
        >
          <input {...getInputProps()} />
          <div className="mb-6">
            <div className={`mx-auto mb-4 transition-all duration-300 ${
              isDragActive ? 'scale-110' : 'scale-100'
            }`}>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Cloud className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
          </div>
          {isDragActive ? (
            <div className="space-y-3">
              <p className="mobile-text-base font-semibold text-blue-600">Drop the files here...</p>
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="mobile-text-base font-semibold text-gray-700 mb-3">
                Drag and drop Excel files here, or click to select files
              </p>
              <p className="mobile-text-sm text-gray-500">
                Supports .xlsx, .xls, and .xlsm files
              </p>
              <div className="flex justify-center space-x-2">
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">.xlsx</div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">.xls</div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">.xlsm</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File List with enhanced styling */}
      {files.length > 0 && (
        <div className="space-responsive">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mobile-mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="mobile-text-base font-semibold text-white">
                Files to Upload ({files.length})
              </h2>
            </div>
            <button
              onClick={uploadAllFiles}
              disabled={uploadMutation.isLoading}
              className="btn btn-success touch-target w-full sm:w-auto"
            >
              <Zap className="h-4 w-4 mr-2" />
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload All Files'}
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {files.map((fileData) => (
              <div key={fileData.id} className="mobile-card group">
                {/* File Header with enhanced styling */}
                <div className="flex items-center justify-between mobile-mb-6">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mr-4 flex-shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mobile-text-sm font-semibold text-gray-900 truncate">
                        {fileData.file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl touch-target transition-all duration-300"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Enhanced Metadata Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block mobile-text-sm font-semibold text-gray-700">
                      File Type *
                    </label>
                    <select
                      value={fileData.fileType}
                      onChange={(e) => updateFileMetadata(fileData.id, 'fileType', e.target.value)}
                      className="input"
                      required
                    >
                      <option value="">Select File Type</option>
                      <option value="Holding">Holding</option>
                      <option value="Offsite">Offsite</option>
                      <option value="Client Query">Client Query</option>
                      <option value="Value Price">Value Price</option>
                      <option value="Report">Report</option>
                      <option value="Analysis">Analysis</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block mobile-text-sm font-semibold text-gray-700">
                      Asset Type *
                    </label>
                    <input
                      type="text"
                      value={fileData.assetType}
                      onChange={(e) => updateFileMetadata(fileData.id, 'assetType', e.target.value)}
                      className="input"
                      placeholder="e.g., Equity, Fixed Income"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block mobile-text-sm font-semibold text-gray-700">
                      Client Code *
                    </label>
                    <select
                      value={fileData.clientCode}
                      onChange={(e) => updateFileMetadata(fileData.id, 'clientCode', e.target.value)}
                      className="input"
                      required
                    >
                      <option value="">Select Client Code</option>
                      {clientCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block mobile-text-sm font-semibold text-gray-700">
                      File Date *
                    </label>
                    <input
                      type="date"
                      value={fileData.fileDate}
                      onChange={(e) => updateFileMetadata(fileData.id, 'fileDate', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>

                {/* Enhanced Upload Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => uploadFile(fileData)}
                    disabled={uploadMutation.isLoading}
                    className="btn btn-primary touch-target"
                  >
                    {uploadMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
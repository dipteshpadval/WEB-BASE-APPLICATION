import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from 'react-query'
import { filesAPI } from '../lib/api'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
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

  const onDrop = useCallback((acceptedFiles: FileList) => {
    const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    const newFiles: FileWithMetadata[] = Array.from(acceptedFiles).map(file => ({
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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-responsive-lg font-bold text-gray-900">Upload Files</h1>
        <p className="text-responsive-sm text-gray-600 mt-1">Upload Excel files with metadata</p>
      </div>

      {/* Drop Zone */}
      <div className="card mb-6 sm:mb-8">
        <div className="card-content">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-responsive-md text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-responsive-md text-gray-600 mb-2">
                  Drag and drop Excel files here, or click to select files
                </p>
                <p className="text-responsive-sm text-gray-500">
                  Supports .xlsx, .xls, and .xlsm files
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-responsive">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-responsive-md font-semibold text-gray-900">
              Files to Upload ({files.length})
            </h2>
            <button
              onClick={uploadAllFiles}
              disabled={uploadMutation.isLoading}
              className="btn btn-primary touch-target"
            >
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload All Files'}
            </button>
          </div>

          <div className="space-y-4">
            {files.map((fileData) => (
              <div key={fileData.id} className="card">
                <div className="card-content">
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-responsive-sm font-medium text-gray-900 truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 touch-target"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Metadata Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
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

                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
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

                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
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

                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700 mb-1">
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

                  {/* Upload Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => uploadFile(fileData)}
                      disabled={uploadMutation.isLoading}
                      className="btn btn-primary touch-target"
                    >
                      {uploadMutation.isLoading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
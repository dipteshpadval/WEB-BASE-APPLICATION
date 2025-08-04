import React, { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { filesAPI } from '../lib/api'
import { Upload, X, FileText, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClientCodes, addClientCode, removeClientCode, resetToDefaultCodes } from '../lib/clientCodes'

interface FileWithMetadata {
  file: File
  fileType: string
  assetType: string
  clientCode: string
  fileDate: string
  id: string
}

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [clientCodes, setClientCodes] = useState<string[]>(getClientCodes())
  const [newClientCode, setNewClientCode] = useState('')
  const [showAddClientCode, setShowAddClientCode] = useState(false)
  const queryClient = useQueryClient()

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
        const uploadDate = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        toast.success(`File ${fileData.file.name} uploaded successfully on ${uploadDate}`)
        setFiles(prev => prev.filter(f => f.id !== fileData.id))
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileData.id]
          return newProgress
        })
        queryClient.invalidateQueries('fileStats')
        queryClient.invalidateQueries('recentFiles')
      },
      onError: (error: any, fileData) => {
        toast.error(`Failed to upload ${fileData.file.name}: ${error.response?.data?.error || 'Upload failed'}`)
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileData.id]
          return newProgress
        })
      },
    }
  )

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onDrop(files)
    }
  }, [onDrop])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      onDrop(files)
    }
  }, [onDrop])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileMetadata = (id: string, field: keyof FileWithMetadata, value: string) => {
    console.log('🔄 Updating metadata:', { id, field, value })
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const handleAddClientCode = () => {
    if (!newClientCode.trim()) {
      toast.error('Please enter a client code')
      return
    }
    
    try {
      const updatedCodes = addClientCode(newClientCode)
      setClientCodes(updatedCodes)
      setNewClientCode('')
      setShowAddClientCode(false)
      toast.success(`Client code "${newClientCode.toUpperCase()}" added successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add client code')
    }
  }

  const handleRemoveClientCode = (codeToRemove: string) => {
    try {
      const updatedCodes = removeClientCode(codeToRemove)
      setClientCodes(updatedCodes)
      toast.success(`Client code "${codeToRemove}" removed successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove client code')
    }
  }

  const handleResetClientCodes = () => {
    try {
      const defaultCodes = resetToDefaultCodes()
      setClientCodes(defaultCodes)
      toast.success('Client codes reset to defaults')
    } catch (error: any) {
      toast.error('Failed to reset client codes')
    }
  }

  const uploadFile = async (fileData: FileWithMetadata) => {
    if (!fileData.fileType || !fileData.assetType || !fileData.clientCode || !fileData.fileDate) {
      toast.error('Please fill in all metadata fields including file date')
      return
    }

    setUploadProgress(prev => ({ ...prev, [fileData.id]: 0 }))
    uploadMutation.mutate(fileData)
  }

  const uploadAllFiles = async () => {
    const validFiles = files.filter(f => f.fileType && f.assetType && f.clientCode && f.fileDate)
    const invalidFiles = files.filter(f => !f.fileType || !f.assetType || !f.clientCode || !f.fileDate)
    
    if (invalidFiles.length > 0) {
      toast.error('Please fill in all metadata fields including file date for all files')
      return
    }

    validFiles.forEach(uploadFile)
  }

  const fileTypes = ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis']
  const assetTypes = ['Equity', 'Fixed Income', 'Real Estate', 'Commodities', 'Cash', 'Other']

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="text-gray-600">Upload multiple files with metadata</p>
      </div>

      <div className="max-w-4xl">
        {/* File Upload Area */}
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
          </div>
          <div className="card-content">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supports Excel files (.xlsx, .xls) up to 10MB each
              </p>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>
        </div>

        {/* Client Code Management */}
        <div className="card mb-6">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Client Code Management</h3>
              <button
                onClick={handleResetClientCodes}
                className="btn btn-secondary btn-sm"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="flex flex-wrap gap-2">
              {clientCodes.map(code => (
                <div key={code} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>{code}</span>
                  <button
                    onClick={() => handleRemoveClientCode(code)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    title="Remove client code"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File List with Metadata */}
        {files.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Files to Upload ({files.length})
                </h3>
                <button
                  onClick={uploadAllFiles}
                  disabled={uploadMutation.isLoading}
                  className="btn btn-primary"
                >
                  Upload All Files
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {files.map((fileData) => (
                  <div key={fileData.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{fileData.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Type *
                        </label>
                        <select
                          value={fileData.fileType}
                          onChange={(e) => updateFileMetadata(fileData.id, 'fileType', e.target.value)}
                          className="input"
                        >
                          <option value="">Select file type</option>
                          {fileTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Asset Type *
                        </label>
                        <select
                          value={fileData.assetType}
                          onChange={(e) => updateFileMetadata(fileData.id, 'assetType', e.target.value)}
                          className="input"
                        >
                          <option value="">Select asset type</option>
                          {assetTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Code *
                        </label>
                        <div className="relative">
                          <select
                            value={fileData.clientCode}
                            onChange={(e) => updateFileMetadata(fileData.id, 'clientCode', e.target.value)}
                            className="input pr-10"
                          >
                            <option value="">Select client code</option>
                            {clientCodes.map(code => (
                              <option key={code} value={code}>{code}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowAddClientCode(true)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-500"
                            title="Add new client code"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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

                    {/* Upload Progress */}
                    {uploadProgress[fileData.id] !== undefined && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Uploading...</span>
                          <span>{uploadProgress[fileData.id]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileData.id]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Upload Button for Individual File */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => uploadFile(fileData)}
                        disabled={uploadMutation.isLoading || !fileData.fileType || !fileData.assetType || !fileData.clientCode || !fileData.fileDate}
                        className="btn btn-primary btn-sm"
                      >
                        Upload File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Client Code Modal */}
        {showAddClientCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Client Code</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Code Name
                  </label>
                  <input
                    type="text"
                    value={newClientCode}
                    onChange={(e) => setNewClientCode(e.target.value)}
                    placeholder="Enter client code name"
                    className="input w-full"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddClientCode()
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddClientCode(false)
                      setNewClientCode('')
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClientCode}
                    disabled={!newClientCode.trim()}
                    className="btn btn-primary"
                  >
                    Add Client Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload 
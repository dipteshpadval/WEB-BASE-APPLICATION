import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Link } from 'react-router-dom'
import { filesAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  Upload, 
  FileText, 
  X, 
  Home,
  Shield,
  LogOut,
  User,
  Cloud,
  Settings,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadMetadata {
  fileType: string
  assetType: string
  clientCode: string
  fileDate: string
}

export default function FileUpload() {
  const { user, logout, getOptions, addOption, deleteOption } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [metadata, setMetadata] = useState<UploadMetadata>({
    fileType: '',
    assetType: '',
    clientCode: '',
    fileDate: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'settings'>('upload')
  const [options, setOptions] = useState({
    fileTypes: ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis'],
    assetTypes: ['Equity', 'Real Estate', 'Fixed Income', 'Commodities', 'Cash'],
    clientCodes: ['CLIENT001', 'CLIENT002', 'CLIENT003', 'CLIENT004', 'CLIENT005']
  })
  const [newOption, setNewOption] = useState({ type: '', value: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickOptions, setShowQuickOptions] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
    toast.success(`${acceptedFiles.length} file(s) selected`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm']
    },
    multiple: true
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Load options on component mount
  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      const response = await getOptions()
      setOptions(response)
    } catch (error) {
      console.error('Failed to load options:', error)
    }
  }

  const handleAddOption = async () => {
    if (!newOption.type || !newOption.value.trim()) {
      toast.error('Please select a type and enter a value')
      return
    }

    // Check if option already exists
    const optionKey = newOption.type === 'fileType' ? 'fileTypes' : 
                     newOption.type === 'assetType' ? 'assetTypes' : 'clientCodes'
    
    if (options[optionKey].includes(newOption.value.trim())) {
      toast.error('This option already exists')
      return
    }

    setIsLoading(true)
    try {
      const response = await addOption(newOption.type, newOption.value.trim())
      setOptions(response.options)
      setNewOption({ type: '', value: '' })
      toast.success('Option added successfully')
    } catch (error) {
      console.error('Failed to add option:', error)
      toast.error('Failed to add option')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOption = async (type: string, value: string) => {
    if (window.confirm(`Are you sure you want to delete "${value}"?`)) {
      setIsLoading(true)
      try {
        const response = await deleteOption(type, value)
        setOptions(response.options)
        toast.success('Option deleted successfully')
      } catch (error) {
        console.error('Failed to delete option:', error)
        toast.error('Failed to delete option')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleUpload = async () => {
    console.log('🚀 Starting upload process...');
    console.log('📁 Files to upload:', uploadedFiles);
    console.log('📋 Metadata:', metadata);

    if (uploadedFiles.length === 0) {
      console.log('❌ No files selected');
      toast.error('Please select files to upload')
      return
    }

    if (!metadata.fileType || !metadata.assetType || !metadata.clientCode || !metadata.fileDate) {
      console.log('❌ Missing metadata:', {
        fileType: metadata.fileType,
        assetType: metadata.assetType,
        clientCode: metadata.clientCode,
        fileDate: metadata.fileDate
      });
      toast.error('Please fill in all metadata fields')
      return
    }

    console.log('✅ All validations passed, starting upload...');
    setIsUploading(true)

    try {
      console.log('📤 Uploading files...');
      const uploadPromises = uploadedFiles.map((file, index) => {
        console.log(`📤 Uploading file ${index + 1}/${uploadedFiles.length}:`, file.name);
        return filesAPI.upload(file, metadata)
      });

      const results = await Promise.all(uploadPromises)
      console.log('✅ All files uploaded successfully:', results);
      
      toast.success('Files uploaded successfully!')
      setUploadedFiles([])
      setMetadata({
        fileType: '',
        assetType: '',
        clientCode: '',
        fileDate: ''
      })
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to upload files';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.msg).join(', ');
      }
      
      toast.error(errorMessage)
    } finally {
      console.log('🏁 Upload process completed');
      setIsUploading(false)
    }
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
              <Link to="/upload" className="flex items-center space-x-2 text-white bg-purple-500 px-3 py-1 rounded-lg">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-purple-500 text-white'
                : 'text-white hover:text-purple-200'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-purple-500 text-white'
                : 'text-white hover:text-purple-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Manage Options</span>
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <>
            {/* File Upload Area */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Excel Files</h3>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 rounded-lg p-3">
                    <Cloud className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the files here' : 'Drag and drop Excel files here, or click to select files'}
                </p>
                
                <p className="text-sm text-gray-500 mb-4">
                  Supports .xlsx, .xls, and .xlsm files
                </p>

                {/* File Type Tags */}
                <div className="flex justify-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    .xlsx
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    .xls
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    .xlsm
                  </span>
                </div>
              </div>

              {/* Selected Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Files</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Form */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">File Metadata</h3>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage Options</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                    <select
                      value={metadata.fileType}
                      onChange={(e) => setMetadata(prev => ({ ...prev, fileType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select file type</option>
                      {options.fileTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                    <select
                      value={metadata.assetType}
                      onChange={(e) => setMetadata(prev => ({ ...prev, assetType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select asset type</option>
                      {options.assetTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Code</label>
                    <select
                      value={metadata.clientCode}
                      onChange={(e) => setMetadata(prev => ({ ...prev, clientCode: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select client code</option>
                      {options.clientCodes.map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Date</label>
                    <input
                      type="date"
                      value={metadata.fileDate}
                      onChange={(e) => setMetadata(prev => ({ ...prev, fileDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Files
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Options Management */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Quick Options Management</h3>
                  <button
                    onClick={() => setShowQuickOptions(!showQuickOptions)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {showQuickOptions ? (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>Hide Options</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>Show Options</span>
                      </>
                    )}
                  </button>
                </div>

                {showQuickOptions && (
                  <div className="space-y-6">
                    {/* Add New Option */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Add New Option</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={newOption.type}
                            onChange={(e) => setNewOption(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          >
                            <option value="">Select type</option>
                            <option value="fileType">File Type</option>
                            <option value="assetType">Asset Type</option>
                            <option value="clientCode">Client Code</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="text"
                            value={newOption.value}
                            onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Enter new value"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newOption.type && newOption.value.trim()) {
                                handleAddOption()
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={handleAddOption}
                            disabled={isLoading || !newOption.type || !newOption.value.trim()}
                            className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            <span>{isLoading ? 'Adding...' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Current Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* File Types */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          File Types ({options.fileTypes.length})
                        </h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {options.fileTypes.map((type) => (
                            <div key={type} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                              <span className="text-gray-900">{type}</span>
                              <button
                                onClick={() => handleDeleteOption('fileType', type)}
                                disabled={isLoading}
                                className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50"
                                title="Delete file type"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Asset Types */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <Settings className="h-3 w-3 mr-1" />
                          Asset Types ({options.assetTypes.length})
                        </h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {options.assetTypes.map((type) => (
                            <div key={type} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                              <span className="text-gray-900">{type}</span>
                              <button
                                onClick={() => handleDeleteOption('assetType', type)}
                                disabled={isLoading}
                                className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50"
                                title="Delete asset type"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Client Codes */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          Client Codes ({options.clientCodes.length})
                        </h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {options.clientCodes.map((code) => (
                            <div key={code} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                              <span className="text-gray-900">{code}</span>
                              <button
                                onClick={() => handleDeleteOption('clientCode', code)}
                                disabled={isLoading}
                                className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50"
                                title="Delete client code"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Manage Upload Options</h3>
            
            {/* Options Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="text-md font-medium text-blue-900 mb-3">Current Options Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{options.fileTypes.length}</div>
                  <div className="text-sm text-blue-700">File Types</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{options.assetTypes.length}</div>
                  <div className="text-sm text-green-700">Asset Types</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">{options.clientCodes.length}</div>
                  <div className="text-sm text-purple-700">Client Codes</div>
                </div>
              </div>
            </div>
            
            {/* Add New Option */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Add New Option</h4>
              <p className="text-sm text-gray-600 mb-4">
                Add new file types, asset types, or client codes that will be available for file uploads.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option Type</label>
                  <select
                    value={newOption.type}
                    onChange={(e) => setNewOption(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select type</option>
                    <option value="fileType">File Type</option>
                    <option value="assetType">Asset Type</option>
                    <option value="clientCode">Client Code</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter new value"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newOption.type && newOption.value.trim()) {
                        handleAddOption()
                      }
                    }}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleAddOption}
                    disabled={isLoading || !newOption.type || !newOption.value.trim()}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                    <Plus className="h-4 w-4" />
                    )}
                    <span>{isLoading ? 'Adding...' : 'Add'}</span>
                  </button>
                  <button
                    onClick={loadOptions}
                    disabled={isLoading}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    title="Refresh options"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* File Types */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  File Types ({options.fileTypes.length})
                </h4>
                <div className="space-y-2">
                  {options.fileTypes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No file types available
                    </div>
                  ) : (
                    options.fileTypes.map((type) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-900 font-medium">{type}</span>
                      <button
                        onClick={() => handleDeleteOption('fileType', type)}
                        disabled={isLoading}
                          className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50 transition-colors"
                          title="Delete file type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* Asset Types */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Asset Types ({options.assetTypes.length})
                </h4>
                <div className="space-y-2">
                  {options.assetTypes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No asset types available
                    </div>
                  ) : (
                    options.assetTypes.map((type) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-900 font-medium">{type}</span>
                      <button
                        onClick={() => handleDeleteOption('assetType', type)}
                        disabled={isLoading}
                          className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50 transition-colors"
                          title="Delete asset type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* Client Codes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Client Codes ({options.clientCodes.length})
                </h4>
                <div className="space-y-2">
                  {options.clientCodes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No client codes available
                    </div>
                  ) : (
                    options.clientCodes.map((code) => (
                      <div key={code} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-900 font-medium">{code}</span>
                      <button
                        onClick={() => handleDeleteOption('clientCode', code)}
                        disabled={isLoading}
                          className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50 transition-colors"
                          title="Delete client code"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
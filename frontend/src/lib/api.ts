import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
  (window.location.hostname === 'certitudetech.netlify.app' 
    ? 'https://web-base-application.onrender.com/api'
    : 'http://localhost:5002/api')

console.log('🌐 API Base URL:', API_BASE_URL)
console.log('📍 Current hostname:', window.location.hostname)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export interface FileStats {
  total_files: number
  file_type_stats: Record<string, number>
  client_code_stats: Record<string, number>
  asset_type_stats: Record<string, number>
  monthly_stats: Record<string, number>
  // Backward compatibility with old property names
  file_types?: Record<string, number>
  client_codes?: Record<string, number>
  asset_types?: Record<string, number>
}

export interface File {
  id: string
  filename: string
  file_type: string
  client_code: string
  asset_type: string
  file_date: string
  uploaded_at: string
  file_size: number
}

export interface FileListResponse {
  files: File[]
  total: number
  page: number
  limit: number
}

export interface User {
  employeeCode: string
  name: string
  mobile: string
  role: string
  status: string
  createdAt: string
}

export const filesAPI = {
  getStats: async (): Promise<FileStats> => {
    const response = await api.get('/files/stats')
    return response.data
  },

  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<FileListResponse> => {
    const response = await api.get('/files', { params })
    return response.data
  },

  upload: async (file: globalThis.File, metadata: { fileType: string; assetType: string; clientCode: string; fileDate: string }): Promise<File> => {
    console.log('📤 Starting file upload...', {
      filename: file.name,
      size: file.size,
      type: file.type,
      metadata
    });

    const formData = new FormData()
    formData.append('file', file as unknown as Blob)
    formData.append('fileType', metadata.fileType)
    formData.append('assetType', metadata.assetType)
    formData.append('clientCode', metadata.clientCode)
    formData.append('fileDate', metadata.fileDate)

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userEmail = user.employeeCode ? `${user.employeeCode}@certitude.com` : 'unknown@certitude.com'

    console.log('👤 User email for upload:', userEmail);

    try {
      console.log('🌐 Making API request to /files/upload...');
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-user': userEmail
      },
    })
      
      console.log('✅ Upload successful:', response.data);
    return response.data
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  download: async (fileId: string): Promise<Blob> => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  delete: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`)
  },
}

export const authAPI = {
  login: async (employeeCode: string, password: string): Promise<{ user: User; message: string }> => {
    const response = await api.post('/auth/login', { employeeCode, password })
    return response.data
  },

  register: async (name: string, mobile: string, employeeCode: string, password: string): Promise<{ user: User; message: string }> => {
    const response = await api.post('/auth/register', { name, mobile, employeeCode, password })
    return response.data
  },

  getUsers: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/auth/users')
    return response.data
  },

  approveUser: async (employeeCode: string): Promise<{ user: User; message: string }> => {
    const response = await api.post(`/auth/approve/${employeeCode}`)
    return response.data
  },

  rejectUser: async (employeeCode: string): Promise<{ user: User; message: string }> => {
    const response = await api.post(`/auth/reject/${employeeCode}`)
    return response.data
  },

  terminateUser: async (employeeCode: string): Promise<{ user: User; message: string }> => {
    const response = await api.post(`/auth/terminate/${employeeCode}`)
    return response.data
  },

  activateUser: async (employeeCode: string): Promise<{ user: User; message: string }> => {
    const response = await api.post(`/auth/activate/${employeeCode}`)
    return response.data
  },

  getStats: async (): Promise<{ totalUsers: number; activeUsers: number; pendingUsers: number; terminatedUsers: number; adminUsers: number }> => {
    const response = await api.get('/auth/stats')
    return response.data
  },

  getLogs: async (): Promise<{ logs: any[] }> => {
    const response = await api.get('/auth/logs')
    return response.data
  },

  getDownloads: async (): Promise<{ downloads: any[] }> => {
    const response = await api.get('/auth/downloads')
    return response.data
  },

  updateUser: async (employeeCode: string, userData: { name?: string; mobile?: string; password?: string; status?: string }): Promise<{ user: User; message: string }> => {
    const response = await api.put(`/auth/update/${employeeCode}`, userData)
    return response.data
  },

  deleteUser: async (employeeCode: string): Promise<{ user: User; message: string }> => {
    const response = await api.delete(`/auth/delete/${employeeCode}`)
    return response.data
  },

  getUserStats: async (): Promise<{ userStats: any[] }> => {
    const response = await api.get('/auth/user-stats')
    return response.data
  },

  updateProfile: async (profileData: { employeeCode: string; name?: string; mobile?: string; currentPassword?: string; newPassword?: string }): Promise<{ user: User; message: string }> => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  // Options management
  getOptions: async (): Promise<{ fileTypes: string[]; assetTypes: string[]; clientCodes: string[] }> => {
    const response = await api.get('/files/options')
    return response.data
  },

  addOption: async (type: string, value: string): Promise<{ message: string; options: any }> => {
    const response = await api.post(`/auth/options/${type}`, { value })
    return response.data
  },

  deleteOption: async (type: string, value: string): Promise<{ message: string; options: any }> => {
    const response = await api.delete(`/auth/options/${type}/${encodeURIComponent(value)}`)
    return response.data
  },
} 
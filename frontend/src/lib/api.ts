import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
  (window.location.hostname === 'certitudetech.netlify.app' 
    ? 'https://web-base-application.onrender.com/api'  // Your actual Render URL
    : 'http://192.168.29.211:5002/api')

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
    const formData = new FormData()
    formData.append('file', file as unknown as Blob)
    formData.append('fileType', metadata.fileType)
    formData.append('assetType', metadata.assetType)
    formData.append('clientCode', metadata.clientCode)
    formData.append('fileDate', metadata.fileDate)

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
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
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (email: string, password: string, name: string): Promise<{ token: string; user: any }> => {
    const response = await api.post('/auth/register', { email, password, name })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
} 
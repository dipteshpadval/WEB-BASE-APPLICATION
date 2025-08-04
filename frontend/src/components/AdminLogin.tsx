import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const { adminLogin, isLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Password is required')
      return
    }

    try {
      await adminLogin(password)
      toast.success('Admin access granted!')
      onSuccess()
    } catch (error) {
      setError('Invalid admin password')
      toast.error('Invalid admin password')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-3xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
          <p className="text-white/70">Enter admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter admin password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80" />
                ) : (
                  <Eye className="h-5 w-5 text-white/50 hover:text-white/80" />
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Access Admin'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/50">
            Default password: <code className="bg-white/10 px-2 py-1 rounded">12345678</code>
          </p>
        </div>
      </div>
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Hash, Lock, Eye, EyeOff, ArrowLeft, UserCheck, UserPlus, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, register, isLoading, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Login form data
  const [loginData, setLoginData] = useState({
    employeeCode: '',
    password: ''
  })

  // Registration form data
  const [registerData, setRegisterData] = useState({
    name: '',
    mobile: '',
    employeeCode: '',
    password: '', // Add password field
  })

  // Debug logging
  useEffect(() => {
    console.log('🔐 Login page loaded successfully!')
    console.log('📍 Current URL:', window.location.href)
    console.log('🎯 Active tab:', activeTab)
    console.log('👤 Auth context loaded:', !!login && !!register)
  }, [activeTab, login, register])

  // Handle redirection after successful login
  useEffect(() => {
    console.log('🔄 Redirection useEffect triggered:', { 
      loginSuccess, 
      isAuthenticated, 
      user: user?.role,
      userStatus: user?.status,
      userEmployeeCode: user?.employeeCode
    })
    
    if (loginSuccess && isAuthenticated && user) {
      console.log('🔄 Login successful, redirecting...')
      console.log('👤 User role:', user.role)
      console.log('👤 User status:', user.status)
      console.log('👤 Full user object:', user)
      
      if (user.role === 'admin') {
        console.log('🔄 Redirecting to admin dashboard...')
        navigate('/admin', { replace: true })
      } else {
        console.log('🔄 Redirecting to user dashboard...')
        navigate('/dashboard', { replace: true })
      }
      setLoginSuccess(false) // Reset the flag
    } else if (loginSuccess && !isAuthenticated) {
      console.log('❌ Login success but not authenticated - this might be the issue!')
    }
  }, [loginSuccess, isAuthenticated, user, navigate])

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {}

    if (!loginData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee code is required'
    }

    if (!loginData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {}

    if (!registerData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (registerData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!registerData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(registerData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number'
    }

    if (!registerData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee code is required'
    } else if (registerData.employeeCode.length < 3) {
      newErrors.employeeCode = 'Employee code must be at least 3 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 Login attempt:', { employeeCode: loginData.employeeCode })
    
    if (!validateLoginForm()) {
      console.log('❌ Form validation failed')
      return
    }

    try {
      console.log('🔄 Calling login function...')
      console.log('📤 Login data:', { employeeCode: loginData.employeeCode, password: '***' })
      
      await login(loginData.employeeCode, loginData.password)
      console.log('✅ Login successful!')
      
      toast.success('Login successful!')
      setLoginSuccess(true) // Trigger the useEffect for redirection
      
    } catch (error: any) {
      console.error('❌ Login error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.message || 'Login failed')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('📝 Registration attempt:', registerData)
    
    if (!validateRegisterForm()) {
      return
    }

    try {
      await register(registerData)
      toast.success('Registration successful! Please wait for admin approval.')
      setActiveTab('login')
      setRegisterData({ name: '', mobile: '', employeeCode: '', password: '' })
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      toast.error(error.message || 'Registration failed')
    }
  }

  const handleInputChange = (formType: 'login' | 'register', field: string, value: string) => {
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }))
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Debug Message */}
        <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
          <p className="text-green-300 text-sm font-medium">✅ NEW LOGIN PAGE LOADED - Version 2.0</p>
          <p className="text-green-300 text-xs mt-1">If you see this message, the new login page is working!</p>
          <p className="text-green-300 text-xs mt-1">URL: {window.location.href}</p>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
          <p className="text-white/70">Sign in or create your account</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-green-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Existing User</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>New User</span>
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Employee Code Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Employee Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={loginData.employeeCode}
                    onChange={(e) => handleInputChange('login', 'employeeCode', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm ${
                      errors.employeeCode ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your employee code"
                    autoFocus
                  />
                </div>
                {errors.employeeCode && (
                  <p className="mt-2 text-sm text-red-400">{errors.employeeCode}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm ${
                      errors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-green-500/30">
                    <UserCheck className="h-4 w-4 text-green-300" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-200">Existing User Login</h3>
                  <p className="text-sm text-green-300 mt-1">
                    Use your employee code and password to access the system. 
                    Only approved users can login.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {activeTab === 'register' && (
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => handleInputChange('register', 'name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                      errors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your full name"
                    autoFocus
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Mobile Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="tel"
                    value={registerData.mobile}
                    onChange={(e) => handleInputChange('register', 'mobile', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                      errors.mobile ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-2 text-sm text-red-400">{errors.mobile}</p>
                )}
              </div>

              {/* Employee Code Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Employee Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={registerData.employeeCode}
                    onChange={(e) => handleInputChange('register', 'employeeCode', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                      errors.employeeCode ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your employee code"
                  />
                </div>
                {errors.employeeCode && (
                  <p className="mt-2 text-sm text-red-400">{errors.employeeCode}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                      errors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-blue-500/30">
                    <UserPlus className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-200">New User Registration</h3>
                  <p className="text-sm text-blue-300 mt-1">
                    Create your account with your details. After registration, 
                    your account will be reviewed by an administrator for approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 
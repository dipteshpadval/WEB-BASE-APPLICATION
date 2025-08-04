import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting React application...')
console.log('📍 Current URL:', window.location.href)
console.log('🌐 User Agent:', navigator.userAgent)

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
  throw new Error('Root element not found')
}

console.log('✅ Root element found, rendering app...')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('✅ React app rendered successfully!')
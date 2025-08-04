// Default client codes for financial institutions
const DEFAULT_CLIENT_CODES = [
  'CANERA',
  'BOI',
  'INVESCO',
  'PGIM',
  'OLD BRIDGE',
  'ADITYA BIRLA',
  'DSP',
  'EDELWEISS',
  'TATA'
]

// Get client codes from localStorage or use defaults
export const getClientCodes = (): string[] => {
  try {
    const stored = localStorage.getItem('clientCodes')
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with default codes
    localStorage.setItem('clientCodes', JSON.stringify(DEFAULT_CLIENT_CODES))
    return DEFAULT_CLIENT_CODES
  } catch (error) {
    console.error('Error loading client codes:', error)
    return DEFAULT_CLIENT_CODES
  }
}

// Add a new client code
export const addClientCode = (newCode: string): string[] => {
  try {
    const codes = getClientCodes()
    const upperCode = newCode.trim().toUpperCase()
    
    // Check if code already exists
    if (codes.includes(upperCode)) {
      throw new Error('Client code already exists')
    }
    
    // Add new code
    const updatedCodes = [...codes, upperCode]
    localStorage.setItem('clientCodes', JSON.stringify(updatedCodes))
    return updatedCodes
  } catch (error) {
    console.error('Error adding client code:', error)
    throw error
  }
}

// Remove a client code
export const removeClientCode = (codeToRemove: string): string[] => {
  try {
    const codes = getClientCodes()
    const updatedCodes = codes.filter(code => code !== codeToRemove)
    localStorage.setItem('clientCodes', JSON.stringify(updatedCodes))
    return updatedCodes
  } catch (error) {
    console.error('Error removing client code:', error)
    throw error
  }
}

// Reset to default codes
export const resetToDefaultCodes = (): string[] => {
  try {
    localStorage.setItem('clientCodes', JSON.stringify(DEFAULT_CLIENT_CODES))
    return DEFAULT_CLIENT_CODES
  } catch (error) {
    console.error('Error resetting client codes:', error)
    return DEFAULT_CLIENT_CODES
  }
} 
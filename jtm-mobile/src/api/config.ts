// JTM Mobile - API Configuration
// For iOS Simulator: use localhost:3000
// For Physical Device: use your computer's IP address (192.168.1.103:3000)
// For Android Emulator: use 10.0.2.2:3000
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // iOS Simulator
  : 'https://your-app.vercel.app/api'

export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 10000,
}

// API response handler
export const handleApiResponse = async (response: Response) => {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred')
  }
  
  return data
}

// Common headers
export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  return headers
}
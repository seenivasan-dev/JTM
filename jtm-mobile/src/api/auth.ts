// JTM Mobile - Authentication API
import { apiConfig, handleApiResponse, getHeaders } from './config'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      isActive: boolean
      mustChangePassword: boolean
    }
    token?: string
  }
  message?: string
  error?: string
}

export interface PasswordChangeRequest {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
  userId: string
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Login attempt:', `${apiConfig.baseUrl}/api/auth/login`)
      const response = await fetch(`${apiConfig.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      })
      
      const result = await handleApiResponse(response)
      console.log('Login response:', result)
      return result
    } catch (error) {
      console.error('Login network error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error. Please check your connection.',
      }
    }
  },
  
  async changePassword(data: PasswordChangeRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('Change password attempt:', `${apiConfig.baseUrl}/api/auth/change-password`)
      const response = await fetch(`${apiConfig.baseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      
      return handleApiResponse(response)
    } catch (error) {
      console.error('Change password network error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error. Please check your connection.',
      }
    }
  },
  
  async register(userData: any): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('Register attempt:', `${apiConfig.baseUrl}/api/auth/register`)
      const response = await fetch(`${apiConfig.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      })
      
      return handleApiResponse(response)
    } catch (error) {
      console.error('Register network error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error. Please check your connection.',
      }
    }
  },
}
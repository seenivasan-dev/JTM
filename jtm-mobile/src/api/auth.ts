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
    const response = await fetch(`${apiConfig.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    })
    
    return handleApiResponse(response)
  },
  
  async changePassword(data: PasswordChangeRequest): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${apiConfig.baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    return handleApiResponse(response)
  },
  
  async register(userData: any): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${apiConfig.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    })
    
    return handleApiResponse(response)
  },
}
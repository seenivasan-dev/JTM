// JTM Shared Types - API Responses and Requests
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    mustChangePassword: boolean;
  };
  token?: string; // For mobile JWT
}

export interface PasswordChangeRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface BulkImportProcess {
  uploadExcel: boolean;
  validateData: boolean;
  reviewMembers: boolean;
  bulkActivation: boolean;
  emailNotification: boolean;
  passwordForceChange: boolean;
}
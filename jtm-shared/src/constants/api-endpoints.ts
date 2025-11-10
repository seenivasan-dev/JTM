// JTM Shared Constants - API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    BULK_IMPORT: '/users/bulk-import',
    ACTIVATE: '/users/activate',
    DEACTIVATE: '/users/deactivate',
  },
  
  // Events
  EVENTS: {
    BASE: '/events',
    RSVP: '/events/rsvp',
    QR_CODE: '/events/qr-code',
    CHECK_IN: '/events/check-in',
  },
  
  // Admin
  ADMIN: {
    MEMBERS: '/admin/members',
    ANALYTICS: '/admin/analytics',
    RENEWALS: '/admin/renewals',
    BULK_ACTIVATE: '/admin/bulk-activate',
  },
} as const;
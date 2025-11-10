// JTM Shared Constants - Membership Types and Settings
export const MEMBERSHIP_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  FAMILY: 'FAMILY',
  CUSTOM: 'CUSTOM',
} as const;

export const MEMBERSHIP_TYPE_LABELS = {
  [MEMBERSHIP_TYPES.INDIVIDUAL]: 'Individual',
  [MEMBERSHIP_TYPES.FAMILY]: 'Family',
  [MEMBERSHIP_TYPES.CUSTOM]: 'Custom',
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export const RENEWAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const RSVP_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const;

export const APP_SETTINGS = {
  MEMBERSHIP_EXPIRY_DATE: 'December 31st 11:59 PM',
  MAX_FAMILY_MEMBERS: 10,
  PASSWORD_MIN_LENGTH: 8,
  QR_CODE_EXPIRY_HOURS: 24,
} as const;
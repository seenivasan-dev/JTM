// JTM Shared Types - User Management
export interface MemberRegistration {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  membershipType: 'Individual' | 'Family' | 'Custom';
  familyMembers?: FamilyMember[];
  address: Address;
}

export interface FamilyMember {
  firstName: string;
  lastName: string;
  age: number;
  contactNumber?: string;
  email?: string;
  relationship: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  eventReminders: boolean;
  membershipRenewal: boolean;
  adminUpdates: boolean;
}

export type MembershipType = 'INDIVIDUAL' | 'FAMILY' | 'CUSTOM';
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
export type RenewalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
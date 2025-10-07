// JTM Web - Zod Validation Schemas
import { z } from 'zod'

// User Registration Schema
export const memberRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  membershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().default('USA'),
  }),
  familyMembers: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    age: z.number().min(0).max(120),
    contactNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    relationship: z.string().min(1, 'Relationship is required'),
  })).optional(),
})

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Password Change Schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Event Creation Schema
export const eventCreationSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Event description is required'),
  date: z.string().datetime('Invalid date format'),
  location: z.string().min(1, 'Event location is required'),
  rsvpRequired: z.boolean().default(false),
  rsvpDeadline: z.string().datetime().optional(),
  maxParticipants: z.number().positive().optional(),
  flyer: z.string().url().optional(),
  rsvpForm: z.object({
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'number', 'select', 'checkbox', 'radio']),
      label: z.string().min(1, 'Field label is required'),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    }))
  }).optional(),
})

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type EventCreationInput = z.infer<typeof eventCreationSchema>
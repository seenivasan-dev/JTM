// JTM Web - Email Service Exports
export { sendEmail, sendBulkEmails, verifyEmailService } from './client'
export type { EmailOptions, EmailResult } from './client'
export {
  generateWelcomeEmail,
  generateRSVPConfirmationEmail,
  generateRSVPApprovedEmail,
  generateEventReminderEmail,
  generateRenewalRequestEmail,
  generateRenewalApprovedEmail,
  generateRenewalRejectedEmail,
  generateRenewalReminderEmail,
  generateAdminRenewalNotificationEmail,
  generatePasswordResetEmail,
  generateNotificationBlastEmail,
} from './templates'

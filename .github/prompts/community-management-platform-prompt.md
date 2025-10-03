# 🏘️ Community Management Platform - GitHub Copilot Agent Prompt

## 🎯 Project Vision
Create a comprehensive community management platform that enables seamless interaction between community admins and members through intuitive mobile and web applications for non-profit organizations.

## 🚀 Core Features Overview
- **User Management**: Dual-role system (Admin/Member) with comprehensive profile management
- **Event Management**: Dynamic RSVP system with real-time updates and QR code check-ins
- **Smart Notifications**: Multi-channel notification system with user preferences
- **Analytics Dashboard**: Comprehensive insights and reporting for admins
- **Cross-Platform**: Unified experience across mobile (iOS/Android) and web
- **Modern UI/UX**: Dark/light themes with accessibility-first design

## 🛠️ Technology Stack

### Frontend
- **Mobile**: Expo + React Native (iOS & Android support)
- **Web**: Next.js with React Native Web
- **Language**: TypeScript
- **UI Components**: NativeBase or Tamagui for cross-platform consistency
- **State Management**: Zustand or Redux Toolkit
- **Navigation**: React Navigation v6

### Backend
- **API**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary (free tier)
- **Email Service**: Resend or SendGrid (free tier)
- **QR Code**: qrcode library for generation, expo-barcode-scanner for scanning

### Deployment & Infrastructure (Low/No Cost)
- **Database**: Railway, Supabase, or PlanetScale (free tiers)
- **API Hosting**: Vercel (free tier)
- **Mobile**: Expo Application Services (EAS)
- **Web Hosting**: Vercel or Netlify
- **CDN**: Cloudflare (free tier)

## 👥 Target Users

### Community Administrators
- Managing events, members, and communications
- Viewing analytics and generating reports
- Bulk member management and approval workflows
- QR code scanning during events

### Community Members
- Participating in events through RSVP
- Receiving updates and notifications
- Networking with other members
- Managing personal and family profiles

## 📱 User Management Requirements

### Registration & Authentication
```typescript
// Member Registration Schema
interface MemberRegistration {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  membershipType: 'Individual' | 'Family' | 'Custom';
  familyMembers?: FamilyMember[];
  address: Address;
}

interface FamilyMember {
  firstName: string;
  lastName: string;
  age: number;
  contactNumber?: string;
  email?: string;
  relationship: string;
}
```

### Key Features
- **Registration Flow**: New members register → Admin verification → Account activation
- **Login System**: Email/username with password, temporary password flow for new users
- **Membership Types**: Individual, Family, Custom with different pricing
- **Family Management**: Add/edit family member details during registration/renewal
- **Annual Renewal**: Membership expires Dec 31st 11:59 PM, renewal with type changes allowed
- **Bulk Import**: Excel sheet upload for existing members with bulk activation
- **Member Status**: Active/Inactive with location-based insights
- **Password Management**: Mandatory password change for one-time passwords, secure password reset
- **Profile Updates**: Members can update contact details, family information anytime
- **Admin Rotation**: Annual admin changes with proper access control transition

### Admin Capabilities
- View all members (active/inactive) with filtering and search
- Bulk member activation after verification
- Process renewal requests with payment validation
- Generate member insights and reports
- Send notifications with temporary passwords
- Excel bulk import with data validation and error handling
- Bulk operations (activation, deactivation, email notifications)
- Payment confirmation number validation for renewals
- Location-wise member distribution insights
- Member renewal request management and approval workflow

### Special Bulk Import Workflow
```typescript
interface BulkImportProcess {
  uploadExcel: boolean;          // Admin uploads Excel with existing member data
  validateData: boolean;         // System validates and shows errors/duplicates
  reviewMembers: boolean;        // Admin reviews all imported member details
  bulkActivation: boolean;       // Admin can bulk activate after verification
  emailNotification: boolean;    // System sends welcome emails with temporary passwords
  passwordForceChange: boolean;  // Members must change password on first login
}
```

### Password Management Requirements
- **One-time Password Flow**: New members receive temporary password via email
- **Mandatory Password Change**: Users cannot access any feature until password is changed
- **Password Security**: Strong password requirements with validation
- **No Navigation Bypass**: System blocks all navigation until password change is complete
- **Session Management**: Secure session handling after password change

## 🎉 Event Management Requirements

### Event Creation & Management
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  flyer?: string; // Image URL
  date: Date;
  location: string;
  rsvpRequired: boolean;
  rsvpForm?: DynamicRSVPForm;
  rsvpDeadline?: Date;
  maxParticipants?: number;
}

interface DynamicRSVPForm {
  fields: RSVPField[];
}

interface RSVPField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  options?: string[]; // For select/radio fields
}
```

### RSVP System Features
- **Dynamic Form Builder**: Admin creates custom RSVP forms per event with drag-and-drop interface
- **Common Fields**: This is based on the event, admin should have option to build any type of fields.
- **Expiration Management**: RSVP deadline with admin ability to snooze/extend
- **Response Management**: View, analyze, and export RSVP responses with detailed insights
- **QR Code System**: Generate unique QR codes after payment verification, mobile scanning for check-in
- **Access Control**: Only active members can submit RSVPs, inactive members see restricted view
- **Payment Integration**: Link RSVP to payment confirmation before QR code generation
- **Real-time Updates**: Live RSVP count and availability tracking
- **Automated Reminders**: Email reminders before RSVP deadline
- **Waitlist Management**: Handle overflow when events reach maximum capacity

### Event Lifecycle Management
```typescript
interface EventLifecycle {
  creation: boolean;           // Admin creates event with all details
  rsvpFormBuilder: boolean;    // Dynamic form creation for event-specific questions
  publication: boolean;        // Event becomes visible to active members
  rsvpCollection: boolean;     // Members submit RSVP responses
  paymentVerification: boolean; // Admin verifies payments and generates QR codes
  reminderSending: boolean;    // Automated reminders before event
  checkInProcess: boolean;     // QR code scanning during event
  postEventAnalytics: boolean; // Attendance reports and insights
}
```

## 🎨 UI/UX Design Guidelines

### Design System
- **Theme Support**: Dark/light mode toggle
- **Accessibility**: WCAG 2.1 AA compliance
- **Typography**: Consistent font scales and hierarchy
- **Color Palette**: Primary, secondary, accent colors with proper contrast
- **Spacing**: 8px grid system
- **Components**: Reusable UI components across platforms

### Mobile UI Patterns
```typescript
// Navigation Structure
const AppNavigation = {
  AuthStack: ['Login', 'Register', 'ForgotPassword'],
  MemberStack: ['Dashboard', 'Events', 'Profile', 'Notifications'],
  AdminStack: ['Dashboard', 'Members', 'Events', 'Analytics', 'Settings']
};
```

### Key Screens
1. **Authentication**: Login, Registration, Password Reset
2. **Dashboard**: Different views for Admin/Member
3. **Events**: List, Details, RSVP Form, QR Scanner (Admin)
4. **Profile**: Personal info, Family members, Membership details
5. **Admin Panel**: Member management, Analytics, Bulk operations

## 📊 Analytics & Reporting

### Member Analytics
- Total active/inactive members
- Membership type distribution
- Location-based insights
- Renewal rate tracking
- Registration trends

### Event Analytics
- RSVP response rates
- Attendance tracking (via QR check-ins)
- Popular event types
- Member engagement metrics
- Food preference analytics

## 📧 Notification System

### Multi-Channel Notifications
- **Email**: Welcome emails, event reminders, renewal notices
- **Push Notifications**: Mobile app notifications for events and updates
- **In-App**: System notifications within the application

### Notification Preferences
```typescript
interface NotificationPreferences {
  email: boolean;
  push: boolean;
  eventReminders: boolean;
  membershipRenewal: boolean;
  adminUpdates: boolean;
}
```

## 🔧 Development Guidelines

### Code Architecture
```
project-root/
├── apps/
│   ├── mobile/          # Expo React Native app
│   ├── web/             # Next.js web app
│   └── api/             # Next.js API routes
├── packages/
│   ├── ui/              # Shared UI components
│   ├── database/        # Prisma schema and client
│   ├── auth/            # Authentication utilities
│   └── utils/           # Shared utilities
└── docs/                # Documentation
```

### Best Practices
- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **Testing**: Jest + React Testing Library for unit tests, Detox for E2E mobile testing
- **Linting**: ESLint + Prettier for code consistency
- **Git Workflow**: Feature branches, conventional commits
- **Error Handling**: Comprehensive error boundaries and logging
- **Security**: Input validation, secure authentication, data encryption

### Production-Ready Requirements
- **Input Validation**: Server-side validation for all forms and API endpoints
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Sanitization**: Prevent SQL injection and XSS attacks
- **File Upload Security**: Secure image upload with size and type validation
- **Session Management**: Secure JWT tokens with proper expiration
- **GDPR Compliance**: Data privacy and deletion capabilities
- **Error Logging**: Comprehensive error tracking with Sentry
- **Performance Monitoring**: Application performance insights
- **Offline Support**: Mobile app offline functionality for critical features
- **Database Backup**: Automated database backups and recovery
- **Health Checks**: API health monitoring and alerts

### Database Schema (Prisma)
```prisma
model User {
  id                String           @id @default(cuid())
  email             String           @unique
  firstName         String
  lastName          String
  mobileNumber      String
  membershipType    MembershipType
  isActive          Boolean          @default(false)
  membershipExpiry  DateTime?
  password          String?          // Hashed password
  tempPassword      String?          // One-time temporary password
  mustChangePassword Boolean         @default(false)
  lastLogin         DateTime?
  importedFromExcel Boolean          @default(false)
  activatedBy       String?          // Admin ID who activated
  activatedAt       DateTime?
  address           Address?
  familyMembers     FamilyMember[]
  rsvpResponses     RSVPResponse[]
  notifications     NotificationPreferences?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
}

model FamilyMember {
  id            String   @id @default(cuid())
  firstName     String
  lastName      String
  age           Int
  contactNumber String?
  email         String?
  relationship  String
  address       String?
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Address {
  id       String  @id @default(cuid())
  street   String
  city     String
  state    String
  zipCode  String
  country  String  @default("USA")
  userId   String  @unique
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Event {
  id              String         @id @default(cuid())
  title           String
  description     String
  flyer           String?
  date            DateTime
  location        String
  rsvpRequired    Boolean        @default(false)
  rsvpDeadline    DateTime?
  maxParticipants Int?
  rsvpForm        Json?          // Dynamic form configuration
  rsvpResponses   RSVPResponse[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model RSVPResponse {
  id                String    @id @default(cuid())
  eventId           String
  userId            String
  responses         Json      // Dynamic form responses
  paymentConfirmed  Boolean   @default(false)
  paymentReference  String?
  qrCode            String?   // Generated QR code for check-in
  checkedIn         Boolean   @default(false)
  checkedInAt       DateTime?
  event             Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([eventId, userId]) // One RSVP per user per event
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  role      AdminRole @default(ADMIN)
  isActive  Boolean  @default(true)
  year      Int      // Admin changes every year
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model NotificationPreferences {
  id                String  @id @default(cuid())
  email             Boolean @default(true)
  push              Boolean @default(true)
  eventReminders    Boolean @default(true)
  membershipRenewal Boolean @default(true)
  adminUpdates      Boolean @default(true)
  userId            String  @unique
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model MembershipRenewal {
  id                String         @id @default(cuid())
  userId            String
  previousType      MembershipType
  newType           MembershipType
  paymentReference  String
  status            RenewalStatus  @default(PENDING)
  adminNotes        String?
  processedAt       DateTime?
  processedBy       String?        // Admin ID
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

enum MembershipType {
  INDIVIDUAL
  FAMILY
  CUSTOM
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MODERATOR
}

enum RenewalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## 🚀 Deployment Strategy

### Environment Setup
1. **Development**: Local development with Docker Compose
2. **Staging**: Preview deployments on Vercel/Railway
3. **Production**: Vercel (web/API) + EAS (mobile) + Railway (database)

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Mobile**: EAS Build for iOS/Android app store deployment
- **Web**: Vercel automatic deployments from main branch
- **Database**: Prisma migrations with Railway

## 📋 Development Checklist

### Phase 1: Foundation
- [ ] Set up monorepo structure with TypeScript
- [ ] Configure Prisma with PostgreSQL and all models
- [ ] Implement authentication system with NextAuth.js
- [ ] Create comprehensive design system with theme support
- [ ] Set up development environment with proper tooling
- [ ] Configure ESLint, Prettier, and Husky pre-commit hooks

### Phase 2: User Management
- [ ] Build complete registration flow with validation
- [ ] Implement secure login with temporary password handling
- [ ] Create member profile management with family members
- [ ] Build admin member management interface with search/filter
- [ ] Add Excel bulk import with data validation
- [ ] Implement membership renewal system with payment validation
- [ ] Add password management and security features

### Phase 3: Event Management
- [ ] Build event creation interface with image upload
- [ ] Implement dynamic RSVP form builder with drag-and-drop
- [ ] Create event listing with filtering and search
- [ ] Build RSVP submission with real-time validation
- [ ] Add QR code generation after payment verification
- [ ] Implement mobile QR code scanner for check-ins
- [ ] Add RSVP deadline management (snooze/extend)

### Phase 4: Notifications & Analytics
- [ ] Set up email notification system with templates
- [ ] Implement push notifications for mobile
- [ ] Build comprehensive analytics dashboard
- [ ] Add member insights and reporting features
- [ ] Create event analytics and attendance tracking
- [ ] Implement automated reminder system

### Phase 5: Production Readiness
- [ ] Comprehensive testing suite (unit, integration, E2E)
- [ ] Performance optimization and caching
- [ ] Security audit and penetration testing
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Error handling and logging implementation
- [ ] Database optimization and indexing
- [ ] API rate limiting and security measures

### Phase 6: Deployment & Monitoring
- [ ] Set up staging and production environments
- [ ] Configure CI/CD pipeline with automated testing
- [ ] Implement health checks and monitoring
- [ ] Set up error tracking with Sentry
- [ ] Configure database backups and recovery
- [ ] Performance monitoring and alerting
- [ ] App store deployment (iOS/Android)

## 💡 GitHub Copilot Usage Tips

When working with this project, use these prompts for better assistance:

1. **Component Generation**: "Create a React Native component for [specific feature] following the design system"
2. **Database Operations**: "Generate Prisma queries for [specific data operation] with proper TypeScript types"
3. **API Endpoints**: "Create Next.js API route for [functionality] with input validation and error handling"
4. **Testing**: "Write comprehensive tests for [component/function] using Jest and React Testing Library"
5. **Styling**: "Create styles for [component] supporting both light and dark themes"

## 📞 Support & Maintenance

### Documentation Requirements
- **API Documentation**: Complete OpenAPI/Swagger documentation for all endpoints
- **Component Library**: Storybook documentation for UI components
- **User Guides**: Comprehensive guides for admins and members
- **Deployment Guide**: Step-by-step deployment and maintenance instructions
- **Database Schema**: Entity relationship diagrams and migration guides
- **Security Policies**: Data handling and privacy policy documentation

### Production Monitoring
- **Application Performance**: Real-time performance monitoring with alerts
- **Error Tracking**: Comprehensive error logging with Sentry integration
- **Analytics**: Privacy-focused usage analytics for insights
- **Uptime Monitoring**: 24/7 uptime monitoring with alerting
- **Database Monitoring**: Query performance and connection monitoring
- **Security Monitoring**: Failed login attempts and suspicious activity alerts

### Maintenance Procedures
- **Regular Backups**: Automated daily database backups with testing
- **Security Updates**: Regular dependency updates and security patches
- **Performance Reviews**: Monthly performance analysis and optimization
- **User Feedback**: Integrated feedback system with issue tracking
- **Admin Training**: Annual admin transition and training procedures
- **Data Cleanup**: Automated cleanup of expired memberships and old data

### Compliance & Security
- **Data Privacy**: GDPR/CCPA compliance with data deletion capabilities
- **Security Audits**: Regular security assessments and penetration testing
- **Access Control**: Role-based access control with audit logging
- **Data Encryption**: End-to-end encryption for sensitive data
- **Backup Recovery**: Tested disaster recovery procedures
- **Incident Response**: Security incident response procedures

---

**Note**: This platform is designed for non-profit organizations with cost-effectiveness in mind. All suggested services have generous free tiers suitable for community-sized deployments. Regular monitoring of usage and costs is recommended to stay within free tier limits.
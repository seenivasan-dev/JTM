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

### Development Environment (macOS)
- **Operating System**: macOS (required for iOS development)
- **Package Manager**: Homebrew for system dependencies
- **Node.js**: Latest LTS via nvm (Node Version Manager)
- **Database**: PostgreSQL (via Docker Desktop or Homebrew)
- **Code Editor**: VS Code with GitHub Copilot extensions
- **Version Control**: Git with GitHub
- **Container**: Docker Desktop for local development
- **iOS Simulator**: Xcode (for React Native iOS testing)

### Required VS Code Extensions
- GitHub Copilot
- GitHub Copilot Chat  
- Expo Tools
- Prisma
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Frontend
- **Mobile**: Expo + React Native (iOS & Android support)
- **Web**: Next.js (standard React, not React Native Web)
- **Language**: TypeScript
- **UI Components**: 
  - **Web**: Tailwind CSS + Shadcn/ui or Chakra UI
  - **Mobile**: NativeBase or Tamagui
- **State Management**: Zustand (recommended) or Redux Toolkit
- **Navigation**: 
  - **Web**: Next.js file-based routing
  - **Mobile**: React Navigation v6

### Backend
- **API**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (web) + JWT tokens (mobile)
- **File Storage**: Cloudinary (free tier) for images and documents
- **Email Service**: Resend (recommended) or SendGrid (free tier)
- **QR Code**: qrcode library for generation, expo-barcode-scanner for scanning
- **Validation**: Zod for schema validation
- **ORM**: Prisma with type-safe database operations

### Deployment & Infrastructure (Low/No Cost)
- **Database**: Railway (recommended), Supabase, or Neon (free tiers)
- **API & Web Hosting**: Vercel (free tier) - handles both web app and API routes
- **Mobile**: Expo Application Services (EAS) for app store builds
- **File Storage**: Cloudinary (free tier) integrated with web app
- **CDN**: Cloudflare (free tier) or Vercel's built-in CDN
- **Environment**: Docker for local PostgreSQL development

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
📁 JTM/ (GitHub Organization or User)
├── 📁 jtm-web/                  # Next.js Web App + API Routes
│   ├── 📁 pages/
│   │   ├── 📁 api/              # API endpoints (backend)
│   │   │   ├── 📁 auth/         # Authentication APIs
│   │   │   │   ├── login.ts
│   │   │   │   ├── register.ts
│   │   │   │   └── [...nextauth].ts
│   │   │   ├── 📁 users/        # User management APIs
│   │   │   │   ├── index.ts
│   │   │   │   ├── [id].ts
│   │   │   │   └── bulk-import.ts
│   │   │   ├── 📁 events/       # Event management APIs
│   │   │   │   ├── index.ts
│   │   │   │   ├── [id].ts
│   │   │   │   └── rsvp.ts
│   │   │   └── 📁 admin/        # Admin APIs
│   │   │       ├── analytics.ts
│   │   │       └── members.ts
│   │   ├── index.tsx            # Homepage
│   │   ├── dashboard.tsx        # Dashboard page
│   │   ├── events/              # Events pages
│   │   │   ├── index.tsx        # Events list
│   │   │   └── [id].tsx         # Event details
│   │   ├── auth/                # Auth pages
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── admin/               # Admin pages
│   │       ├── dashboard.tsx
│   │       └── members.tsx
│   ├── 📁 components/           # Reusable React components
│   │   ├── ui/                  # Basic UI components
│   │   ├── forms/               # Form components
│   │   └── layout/              # Layout components
│   ├── 📁 lib/                  # Server utilities & configurations
│   │   ├── prisma.ts            # Database client
│   │   ├── auth.ts              # Auth configuration
│   │   ├── email.ts             # Email utilities
│   │   └── validations.ts       # Zod schemas
│   ├── 📁 prisma/               # Database
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Database migrations
│   │   └── seed.ts              # Database seeding
│   ├── 📁 styles/               # Styling
│   │   └── globals.css          # Global styles (Tailwind)
│   ├── 📁 types/                # TypeScript type definitions
│   ├── 📁 utils/                # Client-side utilities
│   ├── .env.local               # Environment variables
│   ├── .env.example             # Environment variables template
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── next.config.js           # Next.js configuration
│   └── package.json
├── 📁 jtm-mobile/               # Expo React Native App
│   ├── 📁 src/
│   │   ├── 📁 api/              # API client calls
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   └── events.ts
│   │   ├── 📁 screens/          # Mobile screens
│   │   │   ├── 📁 auth/
│   │   │   ├── 📁 events/
│   │   │   ├── 📁 profile/
│   │   │   └── 📁 admin/
│   │   ├── 📁 components/       # Mobile UI components
│   │   │   ├── ui/              # Basic components
│   │   │   └── forms/           # Form components
│   │   ├── 📁 navigation/       # Navigation configuration
│   │   ├── 📁 utils/            # Mobile utilities
│   │   ├── 📁 types/            # Mobile-specific types
│   │   └── 📁 constants/        # App constants
│   ├── App.tsx                  # Main app component
│   ├── app.config.js            # Expo configuration
│   ├── eas.json                 # EAS build configuration
│   └── package.json
├── 📁 jtm-shared/               # Shared types & utilities (npm package)
│   ├── 📁 types/                # Shared TypeScript interfaces
│   │   ├── user.ts
│   │   ├── event.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── 📁 utils/                # Shared utility functions
│   │   ├── validation.ts
│   │   ├── date.ts
│   │   └── format.ts
│   ├── 📁 constants/            # Shared constants
│   │   ├── api-endpoints.ts
│   │   └── membership-types.ts
│   ├── package.json
│   └── README.md
└── 📁 docs/                     # Documentation
    ├── api.md                   # API documentation
    ├── deployment.md            # Deployment guide
    └── development.md           # Development setup
```

### Best Practices
- **Architecture**: Separate repositories for web+API and mobile with shared types package
- **TypeScript**: Strict mode enabled, comprehensive type definitions with Zod validation
- **Testing**: Jest + React Testing Library for unit tests, Playwright for E2E web testing, Detox for E2E mobile testing
- **Linting**: ESLint + Prettier for code consistency across all repositories
- **Git Workflow**: Feature branches, conventional commits, semantic versioning
- **Error Handling**: Comprehensive error boundaries, proper HTTP status codes, and structured logging
- **Security**: Input validation with Zod, secure authentication, data encryption, CORS configuration
- **API Design**: RESTful APIs with consistent response formats, proper HTTP methods, and error responses
- **Development Environment**: Docker for local PostgreSQL, environment variables management
- **Code Quality**: Husky pre-commit hooks, automated testing in CI/CD

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

### Repository Structure
1. **jtm-web**: Next.js web app + API routes + database (single repo)
2. **jtm-mobile**: Expo React Native app (separate repo)
3. **jtm-shared**: Shared TypeScript types and utilities (optional npm package)

### Environment Setup
1. **Development**: 
   - Local PostgreSQL via Docker Compose or Homebrew
   - jtm-web runs on localhost:3000 (web + API)
   - jtm-mobile connects to local API for development
   - Hot reloading enabled for both web and mobile
2. **Staging**: 
   - Preview deployments on Vercel (web+API) 
   - Staging database on Railway/Supabase
   - EAS Preview builds for mobile testing
3. **Production**: 
   - Vercel (web+API) with production database
   - EAS production builds for App Store/Google Play
   - Environment variables managed securely

### CI/CD Pipeline
- **GitHub Actions**: Separate workflows for web and mobile repositories
- **Web**: Vercel automatic deployments from main branch (web + API together)
- **Mobile**: EAS Build for iOS/Android app store deployment
- **Database**: Prisma migrations with Railway/Supabase

### API Communication
- **Web Frontend**: Direct API calls to `/api/*` routes (same domain)
- **Mobile App**: HTTP calls to `https://your-app.vercel.app/api/*` endpoints
- **Authentication**: JWT tokens for stateless authentication across platforms

## 📋 Development Checklist

### Pre-Development Setup (macOS)
- [ ] **Install System Dependencies**:
  ```bash
  # Install Homebrew
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  
  # Install Node.js via nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install --lts
  nvm use --lts
  
  # Install PostgreSQL and Docker
  brew install postgresql
  brew install --cask docker
  
  # Start PostgreSQL service
  brew services start postgresql
  ```
- [ ] **VS Code Setup**: Install required extensions listed above
- [ ] **GitHub Setup**: Configure Git with your GitHub credentials
- [ ] **Docker Setup**: Start Docker Desktop and verify it's running

### Phase 1: Foundation
- [ ] **macOS Development Setup**: Install Homebrew, Node.js (via nvm), PostgreSQL, Docker Desktop
- [ ] **VS Code Configuration**: Install GitHub Copilot, Copilot Chat, Expo Tools, Prisma extensions
- [ ] Set up separate repositories for web and mobile applications
- [ ] Create jtm-web repository with Next.js + API routes structure
- [ ] Create jtm-mobile repository with Expo React Native
- [ ] Configure local PostgreSQL database (Docker or Homebrew)
- [ ] Configure Prisma with PostgreSQL in web repository
- [ ] Set up jtm-shared package for consistency across platforms
- [ ] Implement authentication system with NextAuth.js (web) and JWT (mobile)
- [ ] Create comprehensive design system with Tailwind CSS (web) and NativeBase (mobile)
- [ ] Set up development environment with proper tooling (ESLint, Prettier, Husky)
- [ ] Configure environment variables and secrets management

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
6. **Cross-platform Development**: "Create shared business logic for jtm-shared package that works with both jtm-web and jtm-mobile"

## 🤖 GitHub Copilot Agent Mode Guidelines

### For Full-Stack Development
When using GitHub Copilot agent mode in VS Code, use these specific prompts:

#### **Project Setup**
- "Set up a new Next.js project with TypeScript, Tailwind CSS, and Prisma"
- "Configure NextAuth.js with database sessions and JWT tokens"
- "Create a new Expo React Native project with TypeScript"
- "Set up Docker Compose for local PostgreSQL development"

#### **Database & API Development**
- "Create Prisma schema for [specific model] with proper relationships"
- "Generate Prisma migrations and update database schema"
- "Create Next.js API route for [specific endpoint] with Zod validation"
- "Implement CRUD operations for [model] with proper error handling"

#### **Authentication & Security**
- "Implement NextAuth.js configuration with email/password provider"
- "Create JWT token validation middleware for API routes"
- "Add role-based access control for admin and member routes"
- "Implement secure password reset flow with temporary tokens"

#### **UI Components & Styling**
- "Create responsive React component with Tailwind CSS"
- "Build React Native screen component with proper navigation"
- "Implement dark/light theme toggle across the application"
- "Create form component with React Hook Form and Zod validation"

#### **Testing & Quality**
- "Write unit tests for [component/function] with Jest"
- "Create E2E tests for user authentication flow"
- "Set up ESLint and Prettier configuration for TypeScript"
- "Implement error boundary components for React"

#### **Deployment & DevOps**
- "Configure Vercel deployment for Next.js with environment variables"
- "Set up EAS build configuration for React Native app"
- "Create GitHub Actions workflow for automated testing"
- "Configure Docker development environment"

### Development Workflow with Copilot
1. **Start with Architecture**: Ask Copilot to explain or set up the project structure
2. **Build Incrementally**: Create one feature at a time with proper testing
3. **Type Safety First**: Always request TypeScript types and Zod schemas
4. **Security Focused**: Ask for input validation and error handling in every API
5. **Cross-Platform Aware**: Specify platform when creating shared logic
6. **Testing Driven**: Request tests alongside feature implementation

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
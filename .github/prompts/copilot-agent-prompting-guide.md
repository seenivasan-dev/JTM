# 🤖 GitHub Copilot Agent - Phase-by-Phase Prompting Guide

## 📋 How to Use This Guide

1. **Keep the main prompt file open** (`community-management-platform-prompt.md`) in your VS Code workspace
2. **Reference it in each conversation** by mentioning "Following the community management platform prompt..."
3. **Work through phases sequentially** - don't skip ahead as each phase builds on the previous
4. **Use specific, detailed prompts** rather than vague requests
5. **Always mention the tech stack** from the prompt to get consistent solutions

---

## 🏗️ Phase 1: Foundation Setup

### 1.1 Initial Project Setup
```
Following the community management platform prompt, create a new monorepo workspace with the following structure:
- apps/mobile (Expo React Native)
- apps/web (Next.js with React Native Web)  
- apps/api (Next.js API routes)
- packages/ui (shared UI components)
- packages/database (Prisma schema)
- packages/auth (authentication utilities)
- packages/utils (shared utilities)

Set up TypeScript configuration, package.json files, and basic folder structure. Include proper .gitignore and README files.
```

### 1.2 Database Schema Setup
```
Based on the community management platform prompt, create a complete Prisma schema that includes:
- User model with password management, bulk import tracking, and membership expiry
- FamilyMember model with complete family details and relationships
- Address model for location-based insights
- Event model with dynamic RSVP support and participant limits
- RSVPResponse model with payment verification and QR code support
- Admin model with annual rotation and role management
- NotificationPreferences model with granular settings
- MembershipRenewal model with approval workflow
- Include all enums (MembershipType, AdminRole, RenewalStatus)
- Add proper indexes for performance and unique constraints
```

### 1.3 Authentication System
```
Following the community management platform prompt, implement NextAuth.js authentication with:
- Email/password login with secure password hashing
- Temporary password flow for bulk imported users
- Mandatory password change for one-time passwords (no navigation bypass)
- Role-based access control (Admin/Member) with middleware
- Password reset functionality with email verification
- Session management with JWT tokens and proper expiration
- Route protection middleware for all authenticated routes
- Admin annual rotation access control
Include both API routes and React hooks for the auth system.
```

### 1.4 Design System Foundation
```
Create a comprehensive design system for the community management platform with:
- Color tokens for light/dark themes
- Typography scale
- Spacing system (8px grid)
- Component tokens
- Accessibility utilities
- Export as TypeScript constants that can be used across React Native and React Native Web
```

---

## 👥 Phase 2: User Management

### 2.1 Registration Flow
```
Following the community management platform prompt, create a multi-step registration component that:
- Collects: firstName, lastName, email, mobileNumber, membershipType
- Shows family member form if Family membership selected
- Includes form validation with proper error handling
- Submits to API with proper TypeScript types
- Works on both mobile and web platforms
- Follows the design system created earlier
```

### 2.2 Admin Member Management & Bulk Import
```
Based on the community management platform prompt, create an admin interface for member management that includes:
- Member list with advanced search and filtering (active/inactive, membership type, location)
- Member detail view with complete edit capabilities
- Excel bulk import system with data validation and error handling
- Bulk activation workflow with email notifications
- Temporary password generation and distribution
- Member status management (activate/deactivate) with audit trail
- Location-wise member insights and analytics
- Payment confirmation validation for renewals
- Include proper TypeScript interfaces and comprehensive API endpoints
```

### 2.3 Membership Renewal System
```
Following the community management platform prompt, implement the membership renewal system:
- Check membership expiry (Dec 31st 11:59 PM)
- Renewal form allowing membership type changes
- Family member modification during renewal
- Payment confirmation validation
- Admin approval workflow
- Email notifications for renewal reminders
Include both frontend components and backend API routes.
```

### 2.4 Member Profile Management
```
Create member profile components following the community management platform prompt:
- Personal information editing
- Family member management (add/edit/remove)
- Contact details updates
- Membership information display
- Notification preferences
- Works across mobile and web with consistent UI
```

---

## 🎉 Phase 3: Event Management

### 3.1 Event Creation Interface
```
Following the community management platform prompt, create an admin event creation form that includes:
- Basic event fields (title, description, date, location)
- Image/flyer upload with Cloudinary integration
- RSVP requirement toggle
- Maximum participants setting
- RSVP deadline configuration
- Form validation and submission
- Preview functionality
```

### 3.2 Dynamic RSVP Form Builder
```
Based on the community management platform prompt, implement a dynamic RSVP form builder that allows admins to:
- Add different field types (text, number, select, checkbox, radio)
- Configure field properties (label, required, options)
- Drag and drop field reordering
- Preview the form as members would see it
- Save form configuration as JSON
- Include common templates (food preferences, participant count, etc.)
```

### 3.3 Event Listing and RSVP
```
Following the community management platform prompt, create event components for members:
- Event list view with filtering and search
- Event detail view with full information
- RSVP form rendering from dynamic configuration
- RSVP submission with validation
- View own RSVP responses
- Event deadline handling
- Only show to active members
```

### 3.4 QR Code System & Event Lifecycle
```
Implement the complete QR code system from the community management platform prompt:
- Generate unique QR codes after payment verification
- Mobile QR code scanner for admin check-ins during events
- Link QR codes to RSVP responses with validation
- Real-time check-in status tracking and updates
- RSVP deadline management with snooze/extend functionality
- Event lifecycle management from creation to post-event analytics
- Export attendee lists and attendance reports
- Waitlist management for overbooked events
- Include expo-barcode-scanner for mobile scanning with proper permissions
```

---

## 📊 Phase 4: Analytics & Notifications

### 4.1 Analytics Dashboard
```
Following the community management platform prompt, create an analytics dashboard for admins with:
- Member analytics (total active/inactive, membership distribution, location insights)
- Event analytics (RSVP rates, attendance, popular events)
- Renewal rate tracking
- Interactive charts using a React Native compatible library
- Export functionality for reports
- Date range filtering
```

### 4.2 Email Notification System
```
Based on the community management platform prompt, implement email notifications using Resend:
- Welcome emails with temporary passwords
- Event reminders
- Membership renewal notices
- Admin notifications for new registrations
- Email templates with proper styling
- Bulk email functionality
- Email preference management
```

### 4.3 Push Notifications
```
Following the community management platform prompt, implement push notifications:
- Expo push notification setup
- Notification scheduling for events
- User notification preferences
- Admin broadcast messaging
- Notification history
- Handle notification permissions properly
```

### 4.4 Reporting System
```
Create comprehensive reporting features following the community management platform prompt:
- Member reports (export to CSV/Excel)
- Event attendance reports
- RSVP response analysis
- Financial reports for memberships
- Custom date range filtering
- Automated report generation and email delivery
```

---

## 🎨 Phase 5: UI/UX Polish

### 5.1 Theme Implementation
```
Following the community management platform prompt, implement comprehensive theming:
- Dark/light mode toggle with system preference detection
- Theme persistence across app restarts
- Consistent theme application across all components
- Accessibility compliance with proper contrast ratios
- Smooth theme transitions
- Platform-specific adaptations
```

### 5.2 Mobile Navigation
```
Based on the community management platform prompt, create navigation systems:
- Tab navigation for main screens
- Stack navigation for detail screens
- Different navigation structures for Admin/Member roles
- Deep linking support
- Navigation state persistence
- Smooth transitions and animations
```

### 5.3 Responsive Web Layout
```
Following the community management platform prompt, create responsive web layouts:
- Mobile-first responsive design
- Sidebar navigation for larger screens
- Grid layouts for member/event lists
- Modal implementations
- Proper keyboard navigation
- Cross-browser compatibility
```

### 5.4 Accessibility Features
```
Implement accessibility features following the community management platform prompt:
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Focus management
- Color contrast validation
- Alternative text for images
- Voice-over support on mobile
```

---

## � Phase 6: Production Readiness & Security

### 6.1 Security Implementation
```
Following the community management platform prompt, implement production security:
- Input validation and sanitization for all forms and API endpoints
- Rate limiting to prevent API abuse
- SQL injection and XSS attack prevention
- Secure file upload with size and type validation
- JWT token security with proper expiration and refresh
- GDPR compliance with data deletion capabilities
- Audit logging for admin actions and sensitive operations
```

### 6.2 Performance & Monitoring
```
Based on the community management platform prompt, implement monitoring:
- Error tracking with Sentry integration
- Application performance monitoring with alerts
- Database query optimization and indexing
- API response caching strategies
- Health checks for all services
- Automated database backups with recovery testing
- Real-time uptime monitoring with alerting
```

### 6.3 Testing Suite
```
Following the community management platform prompt, create comprehensive tests:
- Unit tests for utilities and components using Jest
- Integration tests for API endpoints with database
- E2E tests for critical user flows using Detox
- Accessibility testing for WCAG 2.1 AA compliance
- Performance testing and load testing
- Security testing and penetration testing
- Include comprehensive test coverage reporting
```

### 6.4 Deployment & CI/CD
```
Based on the community management platform prompt, set up deployment:
- Vercel configuration for web and API with environment variables
- EAS configuration for mobile app builds (iOS/Android)
- Database deployment with Railway/Supabase with backups
- CI/CD pipeline with GitHub Actions and automated testing
- Staging environment setup with production-like data
- Production deployment with monitoring and rollback capabilities
- App store deployment process for iOS and Android
```

---

## 💡 Advanced Prompting Tips

### 🎯 Contextual Prompts
Always start with: "Following the community management platform prompt..." to maintain context.

### 🔧 Technical Specificity
Include specific technology mentions:
```
"Using TypeScript, Expo, and the design system from the prompt..."
"Following the Prisma schema in the prompt..."
"Using the navigation structure defined in the prompt..."
```

### 🐛 Debugging Prompts
```
"I'm getting an error in the [component] following the community management platform prompt. The error is [error message]. Please fix it while maintaining compatibility with the existing code structure."
```

### 🔄 Refactoring Prompts
```
"Refactor the [component/function] from the community management platform to be more maintainable and follow the best practices outlined in the prompt."
```

### 📱 Cross-Platform Prompts
```
"Ensure this component works on both React Native mobile and React Native Web following the community management platform prompt specifications."
```

---

## 🚨 Important Notes

1. **Always reference the main prompt** to maintain consistency
2. **Work phase by phase** - don't skip ahead
3. **Test each phase** before moving to the next
4. **Keep the codebase structure** as defined in the prompt
5. **Maintain TypeScript strictness** throughout
6. **Consider mobile-first design** for all UI components
7. **Follow accessibility guidelines** from the start
8. **Use the specified tech stack** consistently

## 📝 Example Conversation Flow

```
You: "Following the community management platform prompt, create a new monorepo workspace..."

Copilot: [Creates the structure]

You: "Now based on the Prisma schema in the prompt, create the database models..."

Copilot: [Creates the schema]

You: "Following the authentication system outlined in the prompt, implement NextAuth.js..."

And so on...
```

This approach ensures that Copilot maintains context throughout the development process and creates a cohesive application that matches your specifications exactly.
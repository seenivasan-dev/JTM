# JTM Community Platform — Requirements Document

**Organization:** Jacksonville Tamil Mandram (JTM)
**Platform:** Web + Mobile-first
**Last Reviewed:** Feb 2026

---

## 1. Overview

The JTM Community Platform manages membership, events, and communications for the Jacksonville Tamil Mandram — a Tamil cultural community based in Jacksonville, Florida. The platform serves three user types: **Admins**, **Active Members**, and **Non-members (Public)**.

---

## 2. User Roles

| Role | Description |
|---|---|
| **Admin** | Full access: manage members, events, renewals, reports, communications |
| **Active Member** | Registered + admin-approved + current membership; RSVP access |
| **Expired Member** | Previously active; can log in but redirected to renewal |
| **Non-member (Public)** | Unauthenticated visitors; read-only access to public pages |

---

## 3. Public Access (Non-Members)

Non-members must be able to browse the site without logging in.

### 3.1 Accessible Pages
| Page | Status | Notes |
|---|---|---|
| Home / Landing (`/`) | ✅ Implemented | Hero, about, gallery, events preview, sponsors |
| ByLaws (`/bylaws`) | ✅ Implemented | Full document with ToC |
| Events listing (`/events`) | ⚠️ **GAP** | Currently requires login; should be public |
| Event detail (`/events/[id]`) | ⚠️ **GAP** | Currently requires login; should be public (no RSVP) |
| Magazines | ❌ **Missing** | Nav link exists; no section/page |
| Tamil Classes | ❌ **Missing** | Nav link exists; no section/page |
| History | ❌ **Missing** | Nav link exists; no section/page |
| FAQ | ❌ **Missing** | Nav link exists; no section/page |
| Contact Us | ❌ **Missing** | Nav link exists; no section/page |
| Membership (info) | ⚠️ Partial | Nav links to register; no info page |
| Sponsors | ✅ Implemented | Scrolling sponsor slider on landing |

### 3.2 RSVP Restriction
- Non-members can **view** events but **cannot RSVP**
- Clicking RSVP while not logged in → show "Please sign in to RSVP" prompt with login link
- **Status:** ⚠️ GAP — currently entire events page requires login

---

## 4. Member Registration & Activation

### 4.1 Self-Registration Flow
| Step | Status |
|---|---|
| Member fills registration form (name, email, phone, address, membership type, family members, payment reference) | ✅ Implemented |
| Account created as inactive — awaiting admin approval | ✅ Implemented |
| Admin reviews new registration in Members list | ✅ Implemented |
| Admin verifies details and payment reference | ✅ Implemented — shown in member detail |
| Admin activates → system generates temp password → sends welcome email | ✅ Implemented |
| Member receives email with temp password | ✅ Implemented |
| Member logs in → forced to change password on first login | ✅ Implemented |
| Admin can ask for more info (notes) or deny | ✅ Implemented — approve/deny available |

### 4.2 Bulk Import (Existing Members)
| Step | Status |
|---|---|
| Admin downloads CSV template | ✅ Implemented |
| Admin uploads CSV with member data (up to 5 family members per row) | ✅ Implemented |
| System creates inactive user accounts with temp passwords | ✅ Implemented |
| Admin reviews import results | ✅ Implemented |
| Admin clicks "Send Welcome Emails" to activate batch | ✅ Implemented |
| Members receive welcome email with temp password | ✅ Implemented |

### 4.3 Email Notifications on Activation
| Email | Status |
|---|---|
| Welcome email with temp password + login URL | ✅ Implemented |
| Security notice (must change password on first login) | ✅ Implemented |

---

## 5. Active Member Features

### 5.1 Dashboard & Profile
| Feature | Status |
|---|---|
| Member dashboard with membership info and upcoming events | ✅ Implemented |
| Edit personal info (name, phone) | ✅ Implemented |
| Manage address | ✅ Implemented |
| Manage family members (add/edit/remove) | ✅ Implemented |
| Change password | ✅ Implemented |
| Notification preferences (email, event reminders, renewal alerts) | ✅ Implemented |

### 5.2 Events & RSVP
| Feature | Status |
|---|---|
| View all events (listing) | ✅ Implemented |
| View event details | ✅ Implemented |
| Submit RSVP with custom form fields | ✅ Implemented |
| Food selection: veg / non-veg / kids (per event config) | ✅ Implemented |
| Support for "no food" option | ✅ Implemented |
| Provide payment reference for paid RSVPs | ✅ Implemented |
| Update already-submitted RSVP | ✅ Implemented (upsert logic) |
| RSVP confirmation email (with payment reference) | ✅ Implemented |
| Admin reviews and approves payment | ✅ Implemented |
| On approval: QR code generated and emailed to member | ✅ Implemented |
| QR code used at event for check-in | ✅ Implemented |
| Event reminder email (days before event) | ✅ Implemented |

### 5.3 Membership Renewal
| Feature | Status |
|---|---|
| Expired member redirected to `/renewal` on login | ✅ Implemented |
| Member submits renewal request with membership type + payment reference | ✅ Implemented |
| Manage family members during renewal (FAMILY type) | ✅ Implemented |
| Confirmation email to member | ✅ Implemented |
| Admin notification email for new renewal | ✅ Implemented |
| Admin reviews renewal in `/admin/renewals` | ✅ Implemented |
| Admin approves → membership updated, expiry set to Dec 31 next year | ✅ Implemented |
| Approval email to member | ✅ Implemented |
| Admin rejects with notes → rejection email to member | ✅ Implemented |
| Annual renewal reminder email (30 days before expiry) | ✅ Implemented |

---

## 6. Admin Workflows

### 6.1 Member Management
| Feature | Status |
|---|---|
| View all members with search and filter (status, type) | ✅ Implemented |
| Activate/deactivate individual members | ✅ Implemented |
| View member details (address, family, payment) | ✅ Implemented |
| Resend activation email | ✅ Implemented |
| Expiring memberships view | ✅ Implemented |
| Send renewal reminder emails | ✅ Implemented |

### 6.2 Bulk Import
| Feature | Status |
|---|---|
| CSV template download (with family member columns) | ✅ Implemented |
| Upload CSV and import members | ✅ Implemented |
| View import results (success/failed rows, temp passwords) | ✅ Implemented |
| Send welcome emails to imported batch | ✅ Implemented |

### 6.3 Event Management
| Feature | Status |
|---|---|
| Create events with title, description, flyer, date, location | ✅ Implemented |
| Configure RSVP required flag | ✅ Implemented |
| Set RSVP deadline and max participants | ✅ Implemented |
| Custom RSVP form field builder (text, number, select, radio, checkbox) | ✅ Implemented |
| Food config: enable veg / non-veg / kids / no-food options | ✅ Implemented |
| Edit existing events | ✅ Implemented |
| View RSVP responses per event | ✅ Implemented |
| Approve/reject RSVP payments | ✅ Implemented |
| QR code generated and emailed on approval | ✅ Implemented |

### 6.4 Notifications / Email Blast
| Feature | Status |
|---|---|
| Send email notification to all/active/inactive/type-filtered members | ✅ Implemented (UI) |
| Include event flyer image in email blast | ⚠️ **GAP** — no file upload/image in notification email |
| Schedule notification for future send | ⚠️ Partial — datetime field exists in UI, backend wiring unclear |

### 6.5 QR Code Check-in
| Feature | Status |
|---|---|
| Create check-in event | ✅ Implemented |
| Upload attendee list (CSV/Excel) with food counts | ✅ Implemented |
| Generate encrypted QR codes per attendee | ✅ Implemented |
| Send QR code emails to attendees | ✅ Implemented |
| QR scanner at event (camera-based) | ✅ Implemented |
| Verify QR code → display attendee info | ✅ Implemented |
| Confirm check-in | ✅ Implemented |
| Check-in statistics (total, checked in, not checked in, rate) | ✅ Implemented |

### 6.6 Reports
| Feature | Status |
|---|---|
| Member reports (total, active, inactive, by type) | ✅ Implemented |
| Event RSVP reports (food counts, payment status, attendee list) | ✅ Implemented |
| Check-in reports (checked-in vs no-show, rate) | ✅ Implemented |
| Analytics dashboard (growth rate, engagement) | ✅ Implemented |

---

## 7. Identified Gaps (Action Required)

### HIGH Priority
| # | Gap | Impact |
|---|---|---|
| G1 | Events page (`/events`) requires login — non-members cannot see public events | Public can't browse events |
| G2 | Event detail page requires login — non-members can't view event info | Public locked out |
| G3 | No RSVP guard with "Login to RSVP" message for non-logged-in visitors | Confusing UX |

### MEDIUM Priority
| # | Gap | Impact |
|---|---|---|
| G4 | No Contact Us section/form on landing page | Visitors can't reach JTM |
| G5 | No FAQ section on landing page | Common questions unanswered |
| G6 | No History section on landing page | Community story missing |
| G7 | No Tamil Classes section on landing page | Key community offering hidden |
| G8 | No Magazines section on landing page | Content not discoverable |
| G9 | Admin notification email blast has no flyer/image upload | Flyer emails manual workaround needed |

### LOW Priority
| # | Gap | Impact |
|---|---|---|
| G10 | Notification API scheduling not wired to actual jobs | Scheduled sends don't fire |
| G11 | Push notification preferences stored but no push service configured | Preference UI inactive |

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Auth | NextAuth.js (JWT strategy, 30-day session) |
| Email | SMTP (Gmail/Google Workspace) |
| QR Codes | AES-256-CBC encrypted, `qrcode` library |
| UI | Tailwind CSS, shadcn/ui components |
| Validation | Zod + React Hook Form |
| File Uploads | Multipart form data (bulk import CSV/Excel) |
| Mobile API | Dedicated `/api/mobile/*` routes |

---

## 9. Data Model Summary

| Model | Key Fields |
|---|---|
| `User` | id, email, firstName, lastName, membershipType, isActive, membershipExpiry, mustChangePassword, tempPassword |
| `Address` | street, city, state, zipCode, country → 1:1 User |
| `FamilyMember` | firstName, lastName, age, relationship → many User |
| `Admin` | email, role (SUPER_ADMIN/ADMIN/MODERATOR), isActive |
| `Event` | title, date, location, rsvpRequired, rsvpDeadline, maxParticipants, rsvpForm (JSON), foodConfig (JSON) |
| `RSVPResponse` | eventId+userId (unique), responses (JSON), paymentConfirmed, qrCode, checkedIn, vegCount, nonVegCount, kidsCount |
| `MembershipRenewal` | userId, newType, paymentReference, status (PENDING/APPROVED/REJECTED), adminNotes |
| `CheckInEvent` | standalone QR check-in events (separate from main Event model) |
| `QRAttendee` | name, email, food counts, emailStatus, isCheckedIn |

---

*Document generated: Feb 2026 — Jacksonville Tamil Mandram Community Platform*

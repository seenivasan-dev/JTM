# JTM Web — Events & RSVP System Design Reference

> **Purpose:** This document is the authoritative reference for the Events, RSVP, QR Check-in, and Reporting system of the Jacksonville Tamil Mandram (JTM) web application. Use this as the source of truth for all feature development, bug fixes, and enhancements.

---

## 1. Purpose & Scope

The JTM web application serves the Tamil community of Jacksonville, FL. The primary mission is to make community events run smoothly — from an admin posting an event, to members RSVPing and checking in at the door.

### Who uses what

| Actor | Interface | Key Actions |
|---|---|---|
| Admin | `/admin/events` | Create / edit / delete events, review RSVPs, approve payments, generate QR codes, check-in members, view reports |
| Member | `/events` | Browse events, RSVP, view food selections, view QR code |
| Public (not logged in) | `/events` | Browse events (read-only), cannot RSVP |

---

## 2. Event Types

Events are categorized by type. Each type may have different RSVP, food, and QR requirements.

| Type | Description | Typical RSVP | Food | QR Check-in |
|---|---|---|---|---|
| Cultural | Pongal, Diwali, Sangamam, Kalai Vizha | Yes | Usually Yes | Yes |
| Sports | Cricket, Volleyball, Badminton | Optional | Optional | Optional |
| Yoga | Yoga sessions | Optional | No | Optional |
| Picnic | Community outdoor events | Yes | Yes | Optional |
| Movie | Tamil movie screenings | Yes | Optional | Yes |
| Literature | Book clubs, poetry readings | Optional | No | No |
| Celebrity | Special guest visits | Yes | Optional | Yes |
| Online | Virtual meetings, webinars | Yes (via link) | No | No |
| Youth | YLC, youth committee meetings | Yes | Optional | Optional |
| General | Other community gatherings | Optional | Optional | Optional |

### Field: `eventType` on Event model
- Type: `String?` (optional, one of the above values)
- Default: `null` (shows as "General")
- Used for: filtering events by type, display badges on cards

---

## 3. Event Data Model

```
Event {
  id                String        (CUID)
  title             String        Required
  description       String        Required
  eventType         String?       Optional — Cultural | Sports | Yoga | Picnic | Movie | Literature | Celebrity | Online | Youth | General
  flyer             String?       Optional — relative path /images/events/... or absolute URL
  date              DateTime      Required — event date/time
  location          String        Required
  rsvpRequired      Boolean       Default false
  rsvpDeadline      DateTime?     Optional — if set, RSVP closes at this time
  maxParticipants   Int?          Optional — if set, RSVP closes when full
  rsvpForm          Json?         Optional — see RSVP Form Schema below
  foodConfig        Json?         Optional — see Food Config Schema below
  paymentRequired   Boolean       Default false — if true, admin must confirm payment
  qrCheckinEnabled  Boolean       Default false — if true, approved RSVPs get QR codes
  createdAt         DateTime
  updatedAt         DateTime
}
```

### rsvpForm JSON Schema
```json
{
  "fields": [
    {
      "id": "field_<timestamp>",
      "type": "text | number | select | checkbox | radio",
      "label": "Display label",
      "required": true | false,
      "options": ["Option A", "Option B"]   // for select/radio only
    }
  ]
}
```

### foodConfig JSON Schema
```json
{
  "enabled": true,
  "vegFood": true,           // veg option available
  "nonVegFood": true,        // non-veg option available
  "kidsFood": true,          // kids meal option available
  "kidsEatFree": false,      // if true, kids meals are free (no count toward payment)
  "allowNoFood": true        // member can opt out of food
}
```

> **Note:** Pricing is not implemented in the system. Payment is manual via Zelle. Admin manually confirms payment in the RSVP management panel after verifying the Zelle reference number.

---

## 4. RSVP Response Data Model

```
RSVPResponse {
  id                String        (CUID)
  eventId           String        FK → Event
  userId            String        FK → User  (unique per event — one RSVP per member per event)
  responses         Json          Dynamic form field values: { fieldId: value }
  paymentConfirmed  Boolean       Default false — set to true by admin after Zelle verification
  paymentReference  String?       Zelle confirmation number (auto-populated from form field)
  qrCode            String?       Plain text QR data: "JTM-EVENT:eventId:userId:timestamp"
  checkedIn         Boolean       Default false — set to true at door
  checkedInAt       DateTime?     Timestamp of check-in
  vegCount          Int           Default 0 — veg meals requested
  nonVegCount       Int           Default 0 — non-veg meals requested
  kidsCount         Int           Default 0 — kids meals requested
  noFood            Boolean       Default false — opted out of food
  createdAt         DateTime
  updatedAt         DateTime
  @@unique([eventId, userId])
}
```

---

## 5. Complete Event Lifecycle

```
1. ADMIN CREATES EVENT
   └─ /admin/events → Create Event form
   └─ Fields: title, type, description, flyer (upload), date, location
   └─ RSVP settings: required?, deadline, capacity
   └─ Food settings: enabled?, veg/nonVeg/kids/kidsEatFree/allowNoFood
   └─ Payment: required? (auto-injects Zelle reference field to RSVP form)
   └─ QR Checkin: enabled?
   └─ POST /api/events → saved to DB

2. ADMIN REVIEWS & POSTS
   └─ Previews event at /events/[id]
   └─ Edit if needed at /admin/events/[id]/edit

3. MEMBER BROWSES EVENTS
   └─ /events → events list (newest first, filter by upcoming/past/type)
   └─ Sees event card: flyer, date, location, RSVP status, own RSVP summary if already RSVP'd
   └─ Not logged in → can browse, cannot RSVP

4. MEMBER RSVPs
   └─ /events/[id] → event detail page
   └─ Fills RSVP form (custom fields + food selection if enabled)
   └─ Submits → POST /api/events/rsvp
   └─ RSVPResponse created: paymentConfirmed=false, qrCode=null
   └─ Confirmation email sent to member
   └─ Member sees "RSVP Submitted — Payment Under Review"

5. ADMIN REVIEWS RSVPs
   └─ /admin/events/[id]/rsvp → AdminRSVPManagement
   └─ Sees list: name, email, payment reference, food selections, status
   └─ Can filter by: pending/approved/checked-in
   └─ Can search by: name, email, payment reference
   └─ Can bulk approve or reject

6. ADMIN APPROVES PAYMENT
   └─ Clicks "Approve" on a pending RSVP
   └─ POST /api/admin/rsvp { action: 'approve_payment' }
   └─ If qrCheckinEnabled:
       → Generates QR data: "JTM-EVENT:eventId:userId:timestamp"
       → Generates PNG QR code image
       → Saves qrCode to RSVPResponse
       → Emails QR code image to member
   └─ If !qrCheckinEnabled:
       → Sets paymentConfirmed=true only
       → Sends plain confirmation email

7. MEMBER GETS QR CODE
   └─ Receives email with QR code PNG attached
   └─ Can view QR on /events/[id] (shown when paymentConfirmed && qrCode)

8. AT THE EVENT — QR DOOR SCAN
   └─ Admin opens /admin/events/[id]/checkin (camera scanner)
   └─ Scans member's QR code (phone or printed)
   └─ POST /api/events/checkin { qrData: "JTM-EVENT:..." }
   └─ System finds RSVPResponse by qrCode value
   └─ Validates: paymentConfirmed=true, not already checkedIn
   └─ Sets checkedIn=true, checkedInAt=now()
   └─ Scanner shows success with member name + food selections

9. ADMIN MONITORS CHECK-INS
   └─ /admin/events/[id]/checkin-dashboard → auto-refreshes every 10s
   └─ Shows: Total RSVPs / Checked In / Pending / food totals

10. ADMIN VIEWS REPORTS
    └─ /admin/events/[id]/reports → RSVPReports
    └─ Total RSVPs, payment status, check-in rate, food breakdown
    └─ Membership type breakdown
    └─ Export: Detailed CSV and Summary CSV
```

---

## 6. API Endpoints

### Events

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/events` | List events (future, asc by date) | No |
| POST | `/api/events` | Create event | Admin ⚠️ (not enforced server-side — bug) |
| GET | `/api/events/[id]` | Get single event | No |
| PUT | `/api/events/[id]` | Update event | Admin ⚠️ (not enforced server-side — bug) |
| DELETE | `/api/events/[id]` | Delete event | Admin ⚠️ (not enforced server-side — bug) |

### RSVP

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/events/rsvp` | Submit RSVP | Member (active) |
| DELETE | `/api/events/rsvp` | Cancel RSVP | Member |
| GET | `/api/events/checkin` | Get event check-in info | - |
| POST | `/api/events/checkin` | Scan QR and check in | Any |

### Admin

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/rsvp` | Get RSVPs for event | Admin |
| POST | `/api/admin/rsvp` | Approve / reject / checkin | Admin |
| GET | `/api/admin/checkin/stats` | Check-in dashboard stats | Admin |
| POST | `/api/admin/checkin/scan` | ⚠️ Broken — uses wrong QR format | Admin |

---

## 7. Food System

### How food selection works at RSVP time

When `foodConfig.enabled = true`, the RSVP form shows a food panel:

```
Number of Veg Meals:      [0][1][2][3]...
Number of Non-Veg Meals:  [0][1][2][3]...  (if nonVegFood=true)
Number of Kids Meals:     [0][1][2][3]...  (if kidsFood=true)
☑ No food for me (event only)              (if allowNoFood=true)
```

Stored in `RSVPResponse`: `vegCount`, `nonVegCount`, `kidsCount`, `noFood`.

### Food in reports

Admin sees food totals per event:
- Total veg meals across all RSVPs
- Total non-veg meals
- Total kids meals
- Count of "no food" attendees
- Total meal count (for catering orders)

### Kids eat free
When `foodConfig.kidsEatFree = true`, the event detail page notes that kids meals are free. Payment calculation remains manual (admin uses Zelle reference for custom amounts).

---

## 8. Payment Flow

1. Member selects food → sees note about payment method in RSVP form
2. Member submits RSVP with Zelle confirmation number (auto-injected text field when `paymentRequired=true`)
3. Admin receives RSVP notification email
4. Admin verifies Zelle payment in their Zelle app
5. Admin approves RSVP → `paymentConfirmed=true` + QR code generated (if enabled)
6. Member receives approval email + QR code

---

## 9. QR Code System

### QR Data Format (Events Module)
```
JTM-EVENT:<eventId>:<userId>:<timestamp>
```
Example: `JTM-EVENT:cm3abc123:cm3xyz789:1704067200000`

### QR Lifecycle
```
1. Admin approves RSVP with qrCheckinEnabled=true
2. Server generates QR string: JTM-EVENT:eventId:userId:timestamp
3. Stored in RSVPResponse.qrCode
4. PNG image generated (qrcode npm package)
5. Email sent to member with QR PNG embedded
6. Member views QR on /events/[id] if paymentConfirmed && qrCode
7. At door: admin scans using /admin/events/[id]/checkin
8. POST /api/events/checkin { qrData } → finds RSVPResponse by qrCode
9. Validates payment confirmed, not already checked in
10. Sets checkedIn=true, returns member name + food selections
```

### ⚠️ Known QR Issues
- `/api/admin/checkin/scan` uses AES-256 decryption but Events QR codes are plain text → scanner fails
- Workaround: use `/admin/events/[id]/checkin` page → `/api/events/checkin` (plain lookup, works)
- Manual check-in via button in RSVP list is always available as fallback

---

## 10. Admin Dashboard Features

### Event List (`/admin/events`)
- Stats: Total Events, Upcoming, Past, Total RSVPs, Avg RSVPs/Event
- Per-event card: stats (Total RSVPs, Approved, Checked In, Pending)
- Buttons: **View RSVPs** → RSVP management | **QR Check-in** → camera scanner | **Reports** → analytics | **Export** → CSV

### RSVP Management (`/admin/events/[id]/rsvp`)
- Filter by status (All / Pending / Approved / Checked In)
- Search by name, email, payment reference
- Per-RSVP action: Approve & Generate QR | Reject | Manual Check-In
- Bulk approve / bulk reject
- View RSVP detail dialog with custom form responses + food selections + QR code
- Export CSV (all fields including dynamic custom RSVP form responses)

### QR Scanner (`/admin/events/[id]/checkin`)
- Camera-based scanner using device camera
- Real-time check-in with member name + food summary displayed on scan

### Check-in Dashboard (`/admin/events/[id]/checkin-dashboard`)
- Auto-refreshes every 10 seconds
- Shows: Total RSVPs | Checked In | Pending | Food totals

### Reports (`/admin/events/[id]/reports`)
- Summary statistics
- Payment status breakdown
- Check-in rate
- Food preferences breakdown
- Membership type breakdown
- Recent activity (24h / 7 days)
- Export: Detailed Report CSV + Summary CSV

---

## 11. Known Bugs & Gaps (As of March 2026)

### Critical
| # | Issue | File | Fix |
|---|---|---|---|
| 1 | POST/PUT/DELETE /api/events have no auth check — any user can create/modify/delete events | `src/app/api/events/route.ts` | Add admin session check |
| 2 | QR scanner `/api/admin/checkin/scan` tries to AES-decrypt plain-text Events QR codes → always fails | `src/app/api/admin/checkin/scan/route.ts` | Handle both formats |
| 3 | Food counts (vegCount, nonVegCount, kidsCount, noFood) missing from RSVP management serialization → admin cannot see food selections | `src/app/admin/events/[id]/rsvp/page.tsx` | Add fields to serialization |
| 4 | Food counts missing from reports serialization → food totals always show 0 | `src/app/admin/events/[id]/reports/page.tsx` | Add fields to serialization |

### Important
| # | Issue | File | Fix |
|---|---|---|---|
| 5 | "QR Check-in" button in AdminEventsView links to RSVP list (`/rsvp`) not camera scanner (`/checkin`) | `AdminEventsView.tsx` line 319 | Change href to `/checkin` |
| 6 | Events API orders ascending (oldest first) while pages order descending (newest first) | `src/app/api/events/route.ts` | Change to `asc → desc` for upcoming, keep all future events |
| 7 | `paymentRequired=true` does not auto-add Zelle reference field to RSVP form | `CreateEventForm.tsx` | Auto-inject when toggled on |
| 8 | Bulk QR upload creates users with plain-text password `'temp-password'` | `/api/admin/rsvp-qrcodes/upload` | Hash the password |

### Minor
| # | Issue | Note |
|---|---|---|
| 9 | No event type / category field | Added in this sprint |
| 10 | No notification to members when new event posted | Future: push notification or email blast |
| 11 | No waiting list when event is full | Future feature |
| 12 | RSVP cancellation sends no email to member | Add cancellation email |
| 13 | Redirect after create event goes to `/events` not to the new event | Change to `router.push('/events/${newId}')` |

---

## 12. Ordering Rules

> **Standard**: All event lists should show **newest/latest events first** (orderBy date DESC).

- Member events page: newest first ✓
- Admin events page: newest first ✓
- In-event RSVP list: newest RSVP first ✓
- Public API `/api/events`: currently ascending — **needs fix**

---

## 13. Multi-Form Events (Cultural Events — Future Design)

Some events like Kalai Vizha (cultural show) need multiple RSVP forms:

| Form | Purpose | Who fills it |
|---|---|---|
| Choreographer Registration | Groups/individuals wanting to perform | Performers |
| Need a Choreographer | Members who need a dance coach | Event participants |
| General Attendance | Audience members with food | All members |

**Current limitation**: The system supports only one `rsvpForm` per event (`@@unique([eventId, userId])`).

**Proposed solution** (future sprint):
- Add `formType` or `formLabel` field to RSVP form config
- Allow multiple RSVPResponse records per user per event (remove unique constraint, add unique on `[eventId, userId, formType]`)
- Show different form depending on member's selection at top of RSVP section

---

## 14. Technology Stack Reference

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (credentials provider) |
| Email | Nodemailer (SMTP) |
| QR Generation | `qrcode` npm package |
| QR Scanning | `@zxing/library` (camera-based) |
| Validation | Zod |
| UI | shadcn/ui + Tailwind CSS |
| File Storage | Local filesystem (`/public/images/events/`) |

---

*Last updated: March 2026 — Sprint: Events & RSVP stabilization*

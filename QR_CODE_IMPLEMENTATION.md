# QR Code Scanning Implementation - Complete Guide

## Overview
The JTM application now has a complete QR code scanning system for event check-ins. This system handles the full workflow from RSVP submission to event check-in using QR codes.

## Features Implemented

### 🌐 Web Application (jtm-web)
1. **Real Camera Integration**
   - Uses `react-webcam` for camera access
   - Uses `jsQR` library for QR code detection
   - Real-time QR code scanning with visual feedback

2. **QR Scanner Interface** (`/events/scanner`)
   - Professional camera overlay with corner indicators
   - Permission handling for camera access
   - Real-time scan results with success/error feedback
   - Manual check-in fallback option

3. **QR Code Display for Members**
   - Enhanced QR code display in event details
   - Clear visual representation with instructions
   - Copy-to-clipboard functionality

4. **API Endpoints**
   - `/api/events/checkin` - QR code based check-in
   - `/api/events/checkin/manual` - Manual email-based check-in
   - Full validation and security checks

### 📱 Mobile Application (jtm-mobile)
1. **Camera Integration**
   - Uses `expo-barcode-scanner` for QR code scanning
   - Native camera permissions handling
   - Optimized for mobile devices

2. **QR Scanner Screen**
   - Native camera interface
   - Real-time QR code detection
   - Manual check-in modal
   - Professional UI with loading states

3. **Permissions Configuration**
   - Camera permissions in app.json
   - iOS usage description
   - Android camera permission

## Complete Workflow

### 1. Event Creation & RSVP Setup
```
Admin creates event → Sets RSVP required → Optionally requires payment
```

### 2. Member RSVP Process
```
Member submits RSVP → Provides payment reference (if required) → Waits for approval
```

### 3. Admin Payment Verification
```
Admin reviews RSVP → Verifies payment → Approves payment → QR code auto-generated
```

### 4. QR Code Generation
```
Format: JTM-EVENT:eventId:userId:timestamp
Example: JTM-EVENT:evt_123456:usr_789:1697123456789
```

### 5. Event Check-in Process
```
Member shows QR code → Admin scans with app → System validates → Check-in recorded
```

## QR Code Format
```
JTM-EVENT:{eventId}:{userId}:{timestamp}
```

### Components:
- **JTM-EVENT**: Identifier prefix
- **eventId**: Unique event identifier
- **userId**: User who owns the QR code
- **timestamp**: Generation timestamp for uniqueness

## Security Features

### 🔒 Authentication & Authorization
- Admin authentication required for scanning
- QR codes tied to specific events and users
- Payment confirmation required before QR generation

### 🛡️ Validation
- QR code format validation
- Event-specific validation
- Payment status verification
- Duplicate check-in prevention

### 🔍 Audit Trail
- Complete check-in history
- Timestamp tracking
- User identification

## API Responses

### Successful Check-in
```json
{
  "success": true,
  "message": "Successfully checked in",
  "rsvp": {
    "id": "rsvp_id",
    "user": { "firstName": "John", "lastName": "Doe", "email": "john@example.com" },
    "event": { "id": "event_id", "title": "Event Name" },
    "checkedInAt": "2023-10-14T10:30:00Z"
  },
  "attendee": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Already Checked In
```json
{
  "success": true,
  "message": "Already checked in",
  "alreadyCheckedIn": true,
  "rsvp": { /* rsvp data */ },
  "attendee": { /* attendee data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Payment not confirmed for this RSVP"
}
```

## Testing the System

### 1. Test QR Code Generation
- Visit: `http://localhost:3001/test/qr-code`
- Generate test QR codes
- Copy codes for testing

### 2. Test QR Scanning (Web)
- Visit: `http://localhost:3001/events/scanner`
- Allow camera permissions
- Scan generated QR codes

### 3. Test QR Scanning (Mobile)
- Open mobile app
- Navigate to Admin → QR Scanner
- Allow camera permissions
- Scan QR codes

## File Structure

### Web Application
```
src/
├── components/events/
│   ├── QRScannerClient.tsx (Main QR scanner)
│   └── EventDetailClient.tsx (QR display for members)
├── app/
│   ├── api/events/checkin/
│   │   ├── route.ts (QR check-in API)
│   │   └── manual/route.ts (Manual check-in API)
│   ├── events/scanner/page.tsx (Scanner page)
│   └── test/qr-code/page.tsx (Test page)
```

### Mobile Application
```
src/
├── screens/admin/
│   └── QRScannerScreen.tsx (Mobile QR scanner)
├── components/
│   └── QRCodeTemplate.tsx (QR display component)
└── api/
    └── config.ts (API configuration)
```

## Dependencies Added

### Web (jtm-web)
```json
{
  "react-webcam": "^7.1.1",
  "jsqr": "^1.4.0"
}
```

### Mobile (jtm-mobile)
```json
{
  "expo-barcode-scanner": "~12.9.0"
}
```

## Configuration Files Updated

### Mobile Permissions (app.json)
```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app uses the camera to scan QR codes for event check-in."
    }
  },
  "android": {
    "permissions": ["android.permission.CAMERA"]
  },
  "plugins": ["expo-barcode-scanner"]
}
```

## Usage Instructions

### For Admins (Event Check-in)
1. **Web**: Navigate to Events → [Event] → QR Scanner
2. **Mobile**: Open app → Admin section → QR Scanner
3. Click "Start Camera/Scanning"
4. Point camera at member's QR code
5. View automatic check-in confirmation

### For Members (Getting QR Code)
1. Submit RSVP for event
2. Provide payment reference (if required)
3. Wait for admin approval
4. View QR code in event details
5. Screenshot or save QR code
6. Show QR code at event for check-in

## Error Handling

### Common Scenarios
- **Invalid QR Code**: Clear error message with format explanation
- **Wrong Event**: QR code not for current event
- **Payment Not Confirmed**: Payment verification required
- **Already Checked In**: Prevents duplicate check-ins
- **Camera Permission Denied**: Clear instructions to enable permissions

### Fallback Options
- **Manual Check-in**: Email-based check-in when QR scanning fails
- **Admin Panel Check-in**: Direct check-in from RSVP management
- **Copy QR Code**: Manual input option for QR code data

## Performance Considerations

### Web
- QR scanning runs at 500ms intervals
- Camera stream optimized for QR detection
- Automatic scan stopping after successful read

### Mobile
- Native barcode scanner for optimal performance
- Automatic scan detection with native callbacks
- Proper camera lifecycle management

## Future Enhancements

### Potential Improvements
1. **Offline Support**: Cache scans for sync later
2. **Bulk Scanning**: Rapid check-in of multiple attendees
3. **Analytics**: Real-time check-in statistics
4. **Notifications**: Push notifications for successful check-ins
5. **QR Code Encryption**: Enhanced security with encrypted QR codes

---

## Quick Start Commands

### Development
```bash
# Start web app
cd jtm-web && npm run dev

# Start mobile app
cd jtm-mobile && npx expo start

# Test QR system
# Visit: http://localhost:3001/test/qr-code
```

### Testing URLs
- **QR Scanner**: http://localhost:3001/events/scanner
- **QR Test Page**: http://localhost:3001/test/qr-code
- **Admin Events**: http://localhost:3001/admin/events

The QR code scanning system is now fully functional and ready for production use! 🎉
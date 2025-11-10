# Mobile Development Network Setup Guide

## Issue: Network request failed error in mobile app

The mobile app is getting "Network request failed" because it's trying to connect to the development server using an IP address that may not be accessible.

## Quick Solutions:

### Option 1: For iOS Simulator (Recommended for testing)
Update `/jtm-mobile/src/api/config.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Use localhost for iOS simulator
  : 'https://your-app.vercel.app/api'
```

### Option 2: For Physical Device
Update `/jtm-mobile/src/api/config.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.103:3000/api'  // Your computer's IP address
  : 'https://your-app.vercel.app/api'
```

Then start the web server with network binding:
```bash
cd /Users/seeni/Repository/JTM/jtm-web
npm run dev -- --hostname 0.0.0.0
```

## Current Mobile API Endpoints (For Testing)

I've created simplified mobile endpoints that don't require authentication:

1. **User Data**: `GET /api/mobile/user`
   - Returns mock user data for testing
   
2. **Events Data**: `GET /api/mobile/events`
   - Returns mock events data for testing

## What I've Fixed:

✅ **Updated MemberDashboardScreen.tsx**:
- Fixed relative API URLs to use full URLs with base configuration
- Added better error handling with network connection tips
- Added console logging for debugging
- Simplified authentication for testing

✅ **Created Mobile API Endpoints**:
- `/api/mobile/user` - Mock user data endpoint
- `/api/mobile/events` - Mock events data endpoint

✅ **Updated API Configuration**:
- Set correct local IP address (192.168.1.103)
- Added proper error handling

## Next Steps:

1. **Choose the appropriate API base URL** based on whether you're using simulator or physical device
2. **Restart both servers**:
   ```bash
   # Terminal 1: Web server
   cd /Users/seeni/Repository/JTM/jtm-web
   npm run dev
   
   # Terminal 2: Mobile app
   cd /Users/seeni/Repository/JTM/jtm-mobile
   npx expo start
   ```

3. **Test the app** - The dashboard should now load with mock data

## Production Notes:

- Replace mock endpoints with real authentication-based endpoints
- Implement proper JWT token management
- Add session persistence with AsyncStorage
- Configure proper CORS settings for production API

The network error should now be resolved! Let me know if you need help with any of these steps.
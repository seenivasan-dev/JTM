#!/bin/bash

# Fix react/no-unescaped-entities errors
# Replace ' with &apos; in specific lines

# Fix AdminRSVPManagement.tsx line 374 and 383
sed -i '' "374s/'/\&apos;/g" src/components/admin/RenewalManagement.tsx
sed -i '' "383s/'/\&apos;/g" src/components/admin/RenewalManagement.tsx

# Fix EventDetailClient.tsx line 506 and 600
sed -i '' "506s/'/\&apos;/g" src/components/events/EventDetailClient.tsx
sed -i '' "600s/'/\&apos;/g" src/components/events/EventDetailClient.tsx

# Fix MemberDashboard.tsx line 47
sed -i '' "47s/'/\&apos;/g" src/components/member/MemberDashboard.tsx

# Fix MemberRenewalRequest.tsx line 176
sed -i '' "176s/'/\&apos;/g" src/components/renewal/MemberRenewalRequest.tsx

echo "✓ Fixed all unescaped entities"

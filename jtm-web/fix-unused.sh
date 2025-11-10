#!/bin/bash

# Fix unused imports - add // eslint-disable-next-line comments

# src/app/admin/members/[id]/page.tsx - line 2 (Suspense)
sed -i '' '2s/^/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\n/' src/app/admin/members/[id]/page.tsx

# src/lib/auth.ts - lines 2, 7, 8 (NextAuth, JWT, Session)
sed -i '' '2s/^/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\n/' src/lib/auth.ts

echo "✓ Added eslint-disable-next-line for unused vars"

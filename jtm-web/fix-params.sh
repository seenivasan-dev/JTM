#!/bin/bash

# Fix Next.js 15 params type issues
# All dynamic route params must be Promises in Next.js 15

files=(
  "src/app/api/events/[id]/route.ts"
  "src/app/api/mobile/events/[id]/route.ts"
  "src/app/api/mobile/events/[id]/rsvp/route.ts"
  "src/app/api/users/[id]/route.ts"
  "src/app/api/users/renewals/[id]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace all instances of { params }: { params: { with { params }: { params: Promise<{
    sed -i '' 's/{ params }: { params: {/{ params }: { params: Promise<{/g' "$file"
    
    # Add await params after each replacement
    sed -i '' 's/const eventId = params\.id/const { id: eventId } = await params/g' "$file"
    sed -i '' 's/const { id } = params/const { id } = await params/g' "$file"
    sed -i '' 's/params\.id/const { id } = await params; const eventId = id/g' "$file"
    
    echo "✓ Fixed $file"
  fi
done

echo "Done!"

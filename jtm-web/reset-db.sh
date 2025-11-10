#!/bin/bash

# JTM Database Reset Helper Script
# This script provides an easy menu to reset and manage your database

echo "🗄️  JTM Database Management"
echo "======================================"
echo ""
echo "What would you like to do?"
echo ""
echo "1) Full Reset (Drop DB + Recreate + Seed)"
echo "2) Just Run Seed (Keep existing data)"
echo "3) View Data (Prisma Studio)"
echo "4) Backup Database"
echo "5) Cancel"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo ""
    echo "⚠️  WARNING: This will DELETE ALL DATA!"
    echo ""
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo ""
      echo "🔄 Resetting database..."
      cd /Users/seeni/Repository/JTM/jtm-web
      npx prisma migrate reset
      echo ""
      echo "✅ Database reset complete!"
      echo ""
      echo "📧 Admin Login:"
      echo "   Email: admin@jtm.org"
      echo "   Password: admin123"
      echo ""
      echo "🌐 Start app: npm run dev"
    else
      echo "❌ Cancelled."
    fi
    ;;
    
  2)
    echo ""
    echo "🌱 Running seed script..."
    cd /Users/seeni/Repository/JTM/jtm-web
    npx prisma db seed
    echo ""
    echo "✅ Seed complete!"
    ;;
    
  3)
    echo ""
    echo "🔍 Opening Prisma Studio..."
    cd /Users/seeni/Repository/JTM/jtm-web
    npx prisma studio
    ;;
    
  4)
    echo ""
    echo "💾 Creating backup..."
    BACKUP_FILE="jtm_db_backup_$(date +%Y%m%d_%H%M%S).sql"
    pg_dump -U seeni jtm_db > "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
    ;;
    
  5)
    echo "👋 Goodbye!"
    ;;
    
  *)
    echo "❌ Invalid choice. Please run again and select 1-5."
    ;;
esac

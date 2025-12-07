# JTM Web - Jacksonville Tamil Mandram Community Portal

A comprehensive community management platform built with Next.js 15, featuring member registration, event management, RSVP system, and administrative tools.

## Features

- 🎯 Member registration and profile management
- 📅 Event creation and RSVP system
- 🎫 QR code generation for event check-ins
- 👥 Family member management
- 💳 Membership renewal workflow
- 📧 Email notifications via Mailchimp Transactional
- 🔐 Secure authentication with NextAuth.js
- 📊 Admin dashboard with analytics
- 🎨 Beautiful Tamil-themed UI with gradient designs

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Mailchimp Transactional (Mandrill) API key for emails

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd jtm-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jtm_db"

# NextAuth - IMPORTANT: Change for production!
NEXTAUTH_URL="https://yourdomain.com"  # Your production URL
NEXTAUTH_SECRET="generate-a-secure-random-string-here"  # Use: openssl rand -base64 32

# JWT
JWT_SECRET="generate-another-secure-random-string"  # Use: openssl rand -base64 32

# Mailchimp Transactional (Mandrill)
MAILCHIMP_API_KEY="your-actual-mailchimp-api-key"
MAILCHIMP_FROM_EMAIL="noreply@yourdomain.com"
MAILCHIMP_FROM_NAME="JTM Community"

# Admin Contact
ADMIN_EMAIL="admin@yourdomain.com"

# App URLs
WEB_APP_URL="https://yourdomain.com"
MOBILE_APP_URL="jtm://app"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed the database with sample data
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Production Deployment

### Option 1: Deploy on Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   
   In Vercel project settings, add all environment variables from `.env`:
   
   - `DATABASE_URL` - Your PostgreSQL connection string (use Vercel Postgres, Neon, or other provider)
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://jtm.yourdomain.com`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `MAILCHIMP_API_KEY` - Your Mailchimp Transactional API key
   - `MAILCHIMP_FROM_EMAIL` - Your verified sender email
   - `MAILCHIMP_FROM_NAME` - Your organization name
   - `ADMIN_EMAIL` - Admin contact email
   - `WEB_APP_URL` - Your production URL
   - `MOBILE_APP_URL` - Your mobile app deep link URL

4. **Deploy**
   
   Vercel will automatically build and deploy your application.

### Option 2: Deploy on Other Platforms

#### For Railway, Render, or similar platforms:

1. **Set environment variables** in platform settings
2. **Build command**: `npm run build`
3. **Start command**: `npm run start`
4. **Ensure PostgreSQL database** is provisioned and connected

#### For VPS/Self-hosted:

```bash
# Build the application
npm run build

# Start production server
npm run start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "jtm-web" -- start
pm2 save
pm2 startup
```

### Database Setup for Production

**Recommended Database Providers:**

- **Vercel Postgres** (if using Vercel)
- **Neon** (Serverless Postgres)
- **Supabase** (Postgres with additional features)
- **Railway** (Postgres with automatic provisioning)

After provisioning, run migrations:

```bash
npx prisma db push
```

### Important Production Checklist

- [ ] Set `NEXTAUTH_SECRET` to a secure random string
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Configure production database URL
- [ ] Set up Mailchimp Transactional API key
- [ ] Verify email sender domain
- [ ] Test email delivery
- [ ] Create admin user in database
- [ ] Configure CORS if needed
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and error tracking

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Production URL | `https://jtm.yourdomain.com` |
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `JWT_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |
| `MAILCHIMP_API_KEY` | Mailchimp API key | Get from Mailchimp dashboard |
| `MAILCHIMP_FROM_EMAIL` | Sender email address | `noreply@yourdomain.com` |
| `MAILCHIMP_FROM_NAME` | Sender name | `JTM Community` |
| `ADMIN_EMAIL` | Admin contact email | `admin@yourdomain.com` |
| `WEB_APP_URL` | Web app URL | `https://yourdomain.com` |
| `MOBILE_APP_URL` | Mobile deep link | `jtm://app` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Tech Stack

- **Framework**: Next.js 15.5.7 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + Shadcn/UI components
- **Email**: Mailchimp Transactional (Mandrill)
- **QR Codes**: qrcode library
- **Forms**: React Hook Form + Zod validation

## Project Structure

```
jtm-web/
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js app router pages
│   │   ├── admin/    # Admin pages
│   │   ├── api/      # API routes
│   │   ├── auth/     # Auth pages (login, register)
│   │   ├── events/   # Event pages
│   │   ├── member/   # Member dashboard
│   │   ├── profile/  # Profile management
│   │   └── renewal/  # Membership renewal
│   ├── components/   # React components
│   │   ├── admin/    # Admin components
│   │   ├── auth/     # Auth forms
│   │   ├── events/   # Event components
│   │   ├── layout/   # Layout components
│   │   ├── member/   # Member components
│   │   └── ui/       # Shadcn UI components
│   └── lib/          # Utilities and configurations
└── middleware.ts     # Next.js middleware
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions, contact: admin@jagadgurutemple.org


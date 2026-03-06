// JTM Web - Redesigned Home Page (Silver Jubilee 2026)
import Link from 'next/link'
import Image from 'next/image'
import { PublicNav } from '@/components/layout/PublicNav'
import {
  Calendar,
  Users,
  Heart,
  Trophy,
  ArrowRight,
  Star,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Sparkles,
  ChevronDown,
} from 'lucide-react'

const galleryImages = [
  { src: '/images/gallery/EC2026Team.jpg', title: 'EC 2026 Team', span: 'lg:col-span-2 lg:row-span-2' },
  { src: '/images/gallery/JTM Sangamam.jpeg', title: 'JTM Sangamam', span: '' },
  { src: '/images/gallery/AnandMemorialTournament.jpeg', title: 'Anand Memorial Tournament', span: '' },
  { src: '/images/gallery/YLC.jpeg', title: 'Youth Leadership Camp', span: '' },
  { src: '/images/gallery/JTMGuest.jpeg', title: 'Special Guest Visit', span: '' },
]

const eventImages = [
  { src: '/images/events/jtm2025KalaiVizha.jpg', title: 'Kalai Vizha', date: 'Dec 2025', month: 'DEC', color: 'from-rose-500 to-pink-600' },
  { src: '/images/events/jtm2025GalaEvent.jpg', title: 'Gala Event', date: 'Nov 2025', month: 'NOV', color: 'from-violet-500 to-purple-600' },
  { src: '/images/events/Pongal Event.jpeg', title: 'Pongal Celebration', date: 'Jan 2026', month: 'JAN', color: 'from-amber-500 to-orange-600' },
  { src: '/images/events/jtm2025-TamizhVizha.jpg', title: 'Tamil Vizha', date: 'Mar 2026', month: 'MAR', color: 'from-emerald-500 to-teal-600' },
  { src: '/images/events/jtm25Sangamam.jpg', title: 'Sangamam', date: 'Apr 2026', month: 'APR', color: 'from-cyan-500 to-blue-600' },
  { src: '/images/events/jtm2025SportsDay.jpg', title: 'Sports Day', date: 'May 2026', month: 'MAY', color: 'from-indigo-500 to-blue-700' },
]

const sponsors = {
  Platinum: [
    { src: '/images/sponsers/Platinum-Bala.jpg', name: 'Bala' },
    { src: '/images/sponsers/Platinum-Community-Foundation.jpg', name: 'Community Foundation' },
    { src: '/images/sponsers/Platinum-Dr-Kani.jpg', name: 'Dr. Kani' },
    { src: '/images/sponsers/Platinum-Mastercraft.jpg', name: 'Mastercraft' },
    { src: '/images/sponsers/Platinum-Peaky-Blinds.jpg', name: 'Peaky Blinds' },
    { src: '/images/sponsers/Platinum-Sridhar.jpg', name: 'Sridhar' },
  ],
  Gold: [
    { src: '/images/sponsers/Gold-Desi-Pantry.png', name: 'Desi Pantry' },
    { src: '/images/sponsers/Gold-Devi.jpg', name: 'Devi' },
    { src: '/images/sponsers/Gold-FloridaBlue.jpg', name: 'Florida Blue' },
    { src: '/images/sponsers/Gold-Joseph.jpg', name: 'Joseph' },
    { src: '/images/sponsers/Gold-Kishek.jpg', name: 'Kishek' },
    { src: '/images/sponsers/Gold-Kolapasi.jpg', name: 'Kolapasi' },
    { src: '/images/sponsers/Gold-Krish.jpg', name: 'Krish' },
    { src: '/images/sponsers/Gold-Sathiyan.jpg', name: 'Sathiyan' },
  ],
  Silver: [
    { src: '/images/sponsers/Silver-Manju-FreshMeats.jpg', name: 'Manju Fresh Meats' },
  ],
  Bronze: [
    { src: '/images/sponsers/Bronze Sponsor - 1.jpg', name: 'Bronze Sponsor 1' },
    { src: '/images/sponsers/Bronze Sponsor - 2.jpg', name: 'Bronze Sponsor 2' },
    { src: '/images/sponsers/Bronze Sponsor - 3.jpg', name: 'Bronze Sponsor 3' },
    { src: '/images/sponsers/Bronze Sponsor - 4.jpg', name: 'Bronze Sponsor 4' },
    { src: '/images/sponsers/Bronze Sponsor - 5.jpg', name: 'Bronze Sponsor 5' },
  ],
  Event: [
    { src: '/images/sponsers/Event-AshleyHomes.jpg', name: 'Ashley Homes' },
    { src: '/images/sponsers/Event-Sponsor-ICIHomes.jpeg', name: 'ICI Homes' },
    { src: '/images/sponsers/Event-Sponsor-Madurai-Kitchen.jpeg', name: 'Madurai Kitchen' },
  ],
}

const faqs = [
  {
    q: 'Who can become a JTM member?',
    a: 'Anyone of Tamil origin or with an interest in Tamil culture living in the Jacksonville, Florida area is welcome to join JTM. We welcome families, individuals, and Tamil enthusiasts of all backgrounds.',
  },
  {
    q: 'What are the membership benefits?',
    a: 'Members enjoy access to all cultural events at discounted rates, voting rights in elections, participation in Tamil classes, access to our community network, and exclusive member-only programs throughout the year.',
  },
  {
    q: 'How do I register for events?',
    a: 'Events can be registered through our member portal. After signing in, visit the Events section, select your event, and complete the RSVP form. You\'ll receive a confirmation email with your QR code.',
  },
  {
    q: 'What is the Tamil class schedule?',
    a: 'Tamil classes run on weekends and are open to all age groups. We offer Beginners, Intermediate, and Advanced levels. Contact us at jtmec2026@gmail.com for the current schedule and enrollment details.',
  },
  {
    q: 'How can I sponsor a JTM event?',
    a: 'We offer Platinum, Gold, Silver, Bronze, and Event-level sponsorship packages. Sponsors receive prominent branding across all event materials, social media, and our website. Reach out to us to learn more.',
  },
  {
    q: 'Is JTM a non-profit organization?',
    a: 'Yes, Jacksonville Tamil Mandram is a registered 501(c)(3) non-profit organization. We have been serving the Tamil community since 2001 and are committed to cultural preservation and community enrichment.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HERO — Full viewport, cinematic
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950">

        {/* ── MOBILE: banner rendered at natural proportions ── */}
        <div className="md:hidden">
          {/* pt-20 offsets the fixed PublicNav */}
          <div className="relative pt-20">
            <Image
              src="/images/banner.png"
              alt="Jacksonville Tamil Mandram"
              width={1920}
              height={400}
              className="w-full h-auto"
              priority
              quality={95}
            />
            {/* Fade bottom of image into dark section */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-cyan-900 to-transparent" />
            {/* Silver Jubilee badge — overlaid on banner */}
            <div className="absolute top-22 right-4 z-20">
              <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-xl flex flex-col items-center justify-center border-4 border-white/40 ring-2 ring-amber-400/50">
                  <span className="text-lg font-black text-amber-900 leading-none">25</span>
                  <span className="text-[8px] font-bold text-amber-800 uppercase tracking-tight leading-none">Years</span>
                </div>
                <div className="mt-1 bg-amber-400/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow">
                  <span className="text-[8px] font-black text-amber-900 uppercase tracking-widest">Silver Jubilee</span>
                </div>
              </div>
            </div>
          </div>
          {/* Kolam pattern */}
          <div className="absolute inset-0 bg-kolam-pattern opacity-10 pointer-events-none" />
          {/* Text content below banner */}
          <div className="relative z-10 px-5 pt-4 pb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Jacksonville, Florida · Est. 2001</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-none mb-2 drop-shadow-xl">வணக்கம்</h1>
            <h2 className="text-xl font-bold text-white/90 mb-3 drop-shadow-lg">Jacksonville Tamil Mandram</h2>
            <p className="text-sm text-white/75 max-w-xl mb-6 leading-relaxed">
              Celebrating 25 years of Tamil culture, heritage, and community in Northeast Florida.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-xl shadow-amber-500/30 transition-all duration-200 active:scale-95">
                Join JTM <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/events" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                View Events <Calendar className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── DESKTOP: full-screen cinematic hero ── */}
        <div className="hidden md:flex flex-col justify-end min-h-screen relative">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/images/banner.png"
              alt="Jacksonville Tamil Mandram"
              fill
              className="object-cover object-top"
              priority
              quality={95}
            />
          </div>
          {/* Kolam pattern */}
          <div className="absolute inset-0 bg-kolam-pattern opacity-10" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          {/* Silver Jubilee badge */}
          <div className="absolute top-28 right-8 z-20">
            <div className="relative flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-2xl flex flex-col items-center justify-center border-4 border-white/40 ring-2 ring-amber-400/50">
                <span className="text-3xl font-black text-amber-900 leading-none">25</span>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-tight leading-none">Years</span>
              </div>
              <div className="mt-1 bg-amber-400/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Silver Jubilee</span>
              </div>
            </div>
          </div>
          {/* Hero text */}
          <div className="relative z-10 px-12 pb-28 max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Jacksonville, Florida · Est. 2001</span>
            </div>
            <h1 className="text-7xl lg:text-8xl font-black text-white leading-none mb-2 drop-shadow-xl">வணக்கம்</h1>
            <h2 className="text-4xl lg:text-5xl font-bold text-white/90 mb-3 drop-shadow-lg">Jacksonville Tamil Mandram</h2>
            <p className="text-xl text-white/75 max-w-xl mb-6 leading-relaxed">
              Celebrating 25 years of Tamil culture, heritage, and community in Northeast Florida.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-xl shadow-amber-500/30 transition-all duration-200 hover:scale-105">
                Join JTM <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/events" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                View Events <Calendar className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/50" />
          </div>
        </div>

      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. STATS BAR — Dark impact strip
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-gray-950 py-8 md:py-14">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-8 text-center">
            {[
              { value: '375+', label: 'Active Members', icon: <Users className="h-5 w-5" /> },
              { value: '25', label: 'Years of Heritage', icon: <Star className="h-5 w-5" /> },
              { value: '500+', label: 'Events Hosted', icon: <Trophy className="h-5 w-5" /> },
              { value: '20+', label: 'Annual Events', icon: <Calendar className="h-5 w-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <div className="text-amber-400 mb-1">{stat.icon}</div>
                <span className="text-3xl md:text-5xl font-black text-white tracking-tight">{stat.value}</span>
                <span className="text-gray-400 text-xs md:text-sm font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. SILVER JUBILEE + EC 2026 SPOTLIGHT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-28 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
        {/* Tamil kolam pattern */}
        <div className="absolute inset-0 bg-kolam-pattern opacity-5" />
        {/* Background glow */}
        <div className="hidden md:block absolute top-0 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="hidden md:block absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Section header */}
          <div className="text-center mb-8 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-full px-5 py-2 mb-5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-amber-700 font-bold text-sm uppercase tracking-widest">Silver Jubilee 2026</span>
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-gray-900 mb-3">
              Celebrating{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                25 Years
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              From a small gathering in 2001 to a thriving community of 375+ families —
              2026 marks our Silver Jubilee, a milestone of Tamil pride in Jacksonville.
            </p>
          </div>

          {/* EC 2026 Team photo */}
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Gold decorative frame corners */}
              <div className="absolute -top-3 -left-3 w-16 h-16 border-t-[3px] border-l-[3px] border-amber-400 rounded-tl-2xl z-10" />
              <div className="absolute -top-3 -right-3 w-16 h-16 border-t-[3px] border-r-[3px] border-amber-400 rounded-tr-2xl z-10" />
              <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-[3px] border-l-[3px] border-amber-400 rounded-bl-2xl z-10" />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-[3px] border-r-[3px] border-amber-400 rounded-br-2xl z-10" />

              {/* Leadership badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs md:text-sm uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-amber-400/40">
                  Leadership 2026
                </div>
              </div>

              {/* Photo */}
              <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-amber-200">
                <div className="relative aspect-[16/9]">
                  <Image
                    src="/images/gallery/EC2026Team.jpg"
                    alt="Jacksonville Tamil Mandram Executive Committee 2026"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="mt-5 bg-white rounded-xl p-4 md:p-5 shadow-md border border-amber-100 text-center">
                <p className="text-gray-700 leading-relaxed">
                  Our Executive Committee 2026 works tirelessly to serve the Tamil community,
                  bringing together families and preserving our rich heritage for future generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. EVENTS — 2026 Calendar
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-3">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-indigo-700 font-bold text-xs uppercase tracking-widest">2026 Season</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900">
                Events & Celebrations
              </h2>
            </div>
            <Link href="/events" className="hidden md:inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
              All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile: horizontal scroll | Desktop: grid */}
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
            {eventImages.map((event) => (
              <div
                key={event.title}
                className="relative flex-none w-[78vw] max-w-[300px] md:w-auto rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group snap-start cursor-pointer"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={event.src}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                {/* Month badge */}
                <div className="absolute top-3 left-3">
                  <div className={`bg-gradient-to-br ${event.color} text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-lg`}>
                    {event.month}
                  </div>
                </div>
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-lg leading-tight">{event.title}</p>
                  <p className="text-white/70 text-sm">{event.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/events" className="inline-flex items-center gap-2 text-indigo-600 font-semibold border border-indigo-200 rounded-xl px-5 py-2.5 hover:bg-indigo-50 transition-colors">
              View All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. OUR STORY — Mission + compact history
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-kolam-pattern opacity-5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
              {/* Left — story text */}
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-white/80 font-bold text-xs uppercase tracking-widest">Our Story</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
                  25 Years of{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Tamil Pride
                  </span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Founded in 2001, Jacksonville Tamil Mandram began as a small gathering of Tamil families
                  determined to keep their culture alive in Northeast Florida. Today, we are a 501(c)(3)
                  non-profit serving 375+ members with cultural events, Tamil education, and community programs.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: <Users className="h-5 w-5 text-cyan-400" />, title: 'Community First', desc: 'Every program is designed to strengthen bonds between Tamil families' },
                    { icon: <BookOpen className="h-5 w-5 text-amber-400" />, title: 'Cultural Education', desc: 'Tamil language classes, arts, and heritage programs for all ages' },
                    { icon: <Trophy className="h-5 w-5 text-rose-400" />, title: 'Celebrating Heritage', desc: '20+ events annually honoring Tamil traditions and milestones' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — milestone timeline */}
              <div className="relative pl-8 border-l border-white/10">
                {[
                  { year: '2001', title: 'Founded', desc: 'JTM established by Tamil families in Jacksonville' },
                  { year: '2010', title: 'Non-Profit', desc: 'Registered as 501(c)(3) non-profit organization' },
                  { year: '2015', title: 'Community Growth', desc: 'Expanded to 200+ member families with new programs' },
                  { year: '2020', title: 'Digital Era', desc: 'Launched online events and member portal' },
                  { year: '2026', title: 'Silver Jubilee', desc: 'Celebrating 25 years of Tamil heritage in Florida' },
                ].map((item, i) => (
                  <div key={item.year} className="relative mb-8 last:mb-0">
                    {/* Dot */}
                    <div className={`absolute -left-[2.35rem] top-1 w-4 h-4 rounded-full border-2 ${i === 4 ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/50' : 'bg-gray-800 border-white/20'}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${i === 4 ? 'text-amber-400' : 'text-gray-500'}`}>{item.year}</span>
                    <p className="font-bold text-white mt-0.5">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. GALLERY — Bento asymmetric grid
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">
              Community Moments
            </h2>
            <p className="text-gray-500 text-lg">A glimpse into our vibrant community life</p>
          </div>
          {/* Bento layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
            {/* Large feature image */}
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
              <div className="relative aspect-square md:aspect-auto md:h-full min-h-[240px]">
                <Image
                  src={galleryImages[0].src}
                  alt={galleryImages[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-bold text-sm">{galleryImages[0].title}</p>
                </div>
              </div>
            </div>
            {/* Smaller images */}
            {galleryImages.slice(1).map((img) => (
              <div key={img.src} className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer">
                <div className="relative aspect-square">
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-semibold text-xs">{img.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. TAMIL CLASSES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 mb-5">
                  <BookOpen className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-cyan-700 font-bold text-xs uppercase tracking-widest">Tamil Education</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                  Learn Tamil,<br />
                  <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                    Live the Culture
                  </span>
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our weekend Tamil classes are open to all ages — from young children discovering their roots
                  to adults reconnecting with their mother tongue. Expert instructors, fun curriculum.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105">
                  Enroll Today <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { level: 'Beginners', desc: 'Alphabet, basic words, and foundational reading skills', age: 'Ages 5+', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                  { level: 'Intermediate', desc: 'Reading comprehension, grammar, and conversational Tamil', age: 'All Ages', color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
                  { level: 'Advanced', desc: 'Literature, classical Tamil, and cultural deep-dives', age: 'Teens & Adults', color: 'from-violet-500 to-indigo-600', bg: 'bg-violet-50', border: 'border-violet-200' },
                ].map((cls) => (
                  <div key={cls.level} className={`${cls.bg} border ${cls.border} rounded-2xl p-5 flex items-start gap-4`}>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-gray-900">{cls.level}</p>
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{cls.age}</span>
                      </div>
                      <p className="text-sm text-gray-600">{cls.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          8. SPONSORS — Tiered display (replaces old slider)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-gray-600 font-bold text-xs uppercase tracking-widest">Our Valued Sponsors</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Community Partners
            </h2>
            <p className="text-gray-500 mt-3">Thank you to our generous sponsors who make our events possible</p>
          </div>

          {/* Platinum */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <span>⬡</span> Platinum
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {sponsors.Platinum.map((s) => (
                <div key={s.name} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[3/2]">
                    <Image src={s.src} alt={s.name} fill className="object-contain p-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gold */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <span>★</span> Gold
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {sponsors.Gold.map((s) => (
                <div key={s.name} className="bg-white rounded-xl overflow-hidden shadow border border-amber-50 hover:shadow-md transition-shadow">
                  <div className="relative aspect-[3/2]">
                    <Image src={s.src} alt={s.name} fill className="object-contain p-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Silver */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-400 to-gray-400 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <span>◆</span> Silver
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="flex justify-center gap-3">
              {sponsors.Silver.map((s) => (
                <div key={s.name} className="bg-white rounded-xl overflow-hidden shadow border border-gray-100 w-36 hover:shadow-md transition-shadow">
                  <div className="relative aspect-[3/2]">
                    <Image src={s.src} alt={s.name} fill className="object-contain p-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bronze */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-700 to-amber-700 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <span>●</span> Bronze
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
              {sponsors.Bronze.map((s) => (
                <div key={s.name} className="bg-white rounded-xl overflow-hidden shadow border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative aspect-[3/2]">
                    <Image src={s.src} alt={s.name} fill className="object-contain p-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Sponsors */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <Calendar className="h-3 w-3" /> Event Sponsors
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {sponsors.Event.map((s) => (
                <div key={s.name} className="bg-white rounded-xl overflow-hidden shadow border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative aspect-[3/2]">
                    <Image src={s.src} alt={s.name} fill className="object-contain p-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          9. FAQ — Native accordion
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500">Everything you need to know about JTM membership and events</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none hover:bg-gray-100 transition-colors">
                    <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-200 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          10. CONTACT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Contact info */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Get In Touch</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Have a question or want to get involved? We&apos;re always happy to hear from you.
                </p>
                <div className="space-y-5">
                  {[
                    { icon: <Mail className="h-5 w-5 text-cyan-600" />, label: 'Email', value: 'jtmec2026@gmail.com', href: 'mailto:jtmec2026@gmail.com', bg: 'bg-cyan-50', border: 'border-cyan-200' },
                    { icon: <MapPin className="h-5 w-5 text-rose-500" />, label: 'Location', value: 'Jacksonville, Florida', href: 'https://maps.google.com/?q=Jacksonville,FL', bg: 'bg-rose-50', border: 'border-rose-200' },
                    { icon: <Phone className="h-5 w-5 text-emerald-600" />, label: 'Connect', value: 'Join our WhatsApp community', href: '#', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-4 p-4 ${item.bg} border ${item.border} rounded-2xl hover:shadow-md transition-shadow group`}
                    >
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
                <form action="mailto:jtmec2026@gmail.com" method="post" encType="text/plain" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                      <input name="firstName" type="text" placeholder="First name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400 placeholder:italic" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                      <input name="lastName" type="text" placeholder="Last name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400 placeholder:italic" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input name="email" type="email" placeholder="you@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400 placeholder:italic" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                    <textarea name="message" rows={4} placeholder="How can we help you?" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none placeholder:text-gray-400 placeholder:italic" />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          11. CTA — Silver Jubilee join strip
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-14 md:py-20 overflow-hidden bg-gradient-to-br from-cyan-700 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-white/90 font-bold text-sm">Silver Jubilee 2026</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-white mb-3 drop-shadow-lg">
            Be Part of the<br />
            <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
              Silver Jubilee
            </span>
          </h2>
          <p className="text-white/75 text-xl max-w-xl mx-auto mb-10">
            Join Jacksonville Tamil Mandram and celebrate 25 years of culture, heritage, and community together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-black px-8 py-4 rounded-xl shadow-2xl shadow-amber-400/30 transition-all duration-200 hover:scale-105 text-lg">
              Become a Member
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:jtmec2026@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 text-lg">
              Contact Us
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          12. FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="bg-gray-950 text-white pt-10 md:pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden ring-2 ring-white/10">
                  <Image src="/images/JTMLogo.jpg" alt="JTM" fill className="object-cover" />
                </div>
                <div>
                  <p className="font-black text-lg leading-tight">Jacksonville Tamil Mandram</p>
                  <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Silver Jubilee 2026</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Celebrating Tamil culture, heritage, and community in Northeast Florida since 2001.
                A proud 501(c)(3) non-profit organization.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Quick Links</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Events', href: '/events' },
                  { label: 'Membership', href: '/auth/register' },
                  { label: 'Tamil Classes', href: '#' },
                  { label: 'Gallery', href: '#' },
                  { label: 'Sponsors', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Contact</p>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-cyan-500" />
                  <a href="mailto:jtmec2026@gmail.com" className="hover:text-white transition-colors">jtmec2026@gmail.com</a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-rose-500" />
                  <span>Jacksonville, Florida</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-3">Member Portal</p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Jacksonville Tamil Mandram. All rights reserved.</p>
            <p className="text-amber-500/70 font-semibold">Silver Jubilee · 25 Years of Tamil Heritage · 2001–2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

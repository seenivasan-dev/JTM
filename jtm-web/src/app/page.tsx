// JTM Web - Modern Landing Page
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  Heart, 
  Globe, 
  Trophy,
  ChevronDown,
  Menu,
  ArrowRight,
  Star,
  Award,
  Target,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

// Gallery images
const galleryImages = [
  { src: '/images/gallery/JTM Sangamam.jpeg', title: 'JTM Sangamam' },
  { src: '/images/gallery/EC2025Team.jpeg', title: 'EC 2025 Team' },
  { src: '/images/gallery/AnandMemorialTournament.jpeg', title: 'Anand Memorial Tournament' },
  { src: '/images/gallery/YLC.jpeg', title: 'Youth Leadership Camp' },
  { src: '/images/gallery/JTMGuest.jpeg', title: 'Special Guest Visit' },
  { src: '/images/gallery/Throwball M- Winners.jpeg', title: 'Throwball Winners' },
  { src: '/images/gallery/Throwball W-Winners.jpeg', title: 'Women Throwball Champions' },
  { src: '/images/gallery/YLC1.jpeg', title: 'YLC Activities' },
]

// Event images
const eventImages = [
  { src: '/images/events/jtm2025GalaEvent.jpg', title: 'Gala Event 2025', date: 'Coming Soon' },
  { src: '/images/events/Pongal Event.jpeg', title: 'Pongal Celebration', date: 'January 2025' },
  { src: '/images/events/jtm2025-TamizhVizha.jpg', title: 'Tamilzh Vizha', date: 'March 2025' },
  { src: '/images/events/jtm25Sangamam.jpg', title: 'Sangamam 2025', date: 'April 2025' },
  { src: '/images/events/jtm2025SportsDay.jpg', title: 'Sports Day', date: 'May 2025' },
  { src: '/images/events/jtm2025KalaiVizha.jpg', title: 'Kalai Vizha', date: 'June 2025' },
]

// Sponsor images
const sponsors = [
  { src: '/images/sponsers/ARVA_Platinum.jpeg', name: 'ARVA', level: 'Platinum' },
  { src: '/images/sponsers/MasterCraft_Platinum.jpeg', name: 'MasterCraft', level: 'Platinum' },
  { src: '/images/sponsers/NFMP_Platinum.jpeg', name: 'NFMP', level: 'Platinum' },
  { src: '/images/sponsers/Century21_Gold.jpeg', name: 'Century 21', level: 'Gold' },
  { src: '/images/sponsers/DesiPantry_Gold.jpeg', name: 'Desi Pantry', level: 'Gold' },
  { src: '/images/sponsers/FloridaBlue_Gold.jpeg', name: 'Florida Blue', level: 'Gold' },
  { src: '/images/sponsers/Krish_Gold.jpeg', name: 'Krish', level: 'Gold' },
  { src: '/images/sponsers/FreshMeats.jpeg', name: 'Fresh Meats', level: 'Silver' },
]

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (user) {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
      })

      if (admin) {
        redirect('/admin')
      } else {
        redirect('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl shadow-md z-50 border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform ring-2 ring-blue-300">
                <Image
                  src="/images/JTMLogo.jpg"
                  alt="Jacksonville Tamil Mandram"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Jacksonville Tamil Mandram
                </h1>
                <p className="text-sm text-gray-600">Connecting Communities Since 2010</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden xl:flex items-center gap-1">
              <Link href="#home" className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">
                Home
              </Link>
              {['Election 2025', 'ByLaws', 'Events', 'Membership'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  {item}
                </Link>
              ))}
              <div className="relative group">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1">
                  More <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-white shadow-2xl rounded-xl py-2 min-w-[200px] border border-gray-100">
                  <Link href="#magazines" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Magazines</Link>
                  <Link href="#resources" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Resources</Link>
                  <Link href="#sponsors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Sponsors</Link>
                  <Link href="#tamil-classes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Tamil Classes</Link>
                  <Link href="#gallery" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Gallery</Link>
                  <Link href="#history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">History</Link>
                  <Link href="#faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">FAQ</Link>
                  <Link href="#contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Contact Us</Link>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="hidden md:inline-flex">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
                  <Users className="mr-2 h-4 w-4" />
                  Join Now
                </Button>
              </Link>
              <button className="xl:hidden p-2 hover:bg-blue-50 rounded-lg">
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative pt-20">
        <div className="relative h-[35vh] md:h-[40vh] lg:h-[45vh] w-full">
          <Image
            src="/images/banner.png"
            alt="Jacksonville Tamil Mandram Community"
            fill
            className="object-cover"
            priority
            quality={95}
          />
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-6 py-3 bg-white shadow-lg rounded-full">
              <span className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">வணக்கம் | Welcome</span>
            </div>
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Celebrating Tamil<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Culture & Heritage</span>
            </h3>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join Jacksonville's premier Tamil cultural organization. Experience authentic festivals, 
              connect with community members, and preserve our rich heritage for future generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl px-8 py-6 text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Become a Member
                </Button>
              </Link>
              <Link href="#events">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Events
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-sm font-medium text-gray-600">Members</div>
              </div>
              <div className="text-center border-x border-gray-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">50+</div>
                <div className="text-sm font-medium text-gray-600">Events/Year</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">15+</div>
                <div className="text-sm font-medium text-gray-600">Years</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Jacksonville Tamil Mandram</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Jacksonville Tamil Mandram (JTM) is a vibrant non-profit organization dedicated to preserving and promoting 
              Tamil culture, language, and traditions in Northeast Florida. Since 2010, we have been bringing together 
              Tamil-speaking families to celebrate our rich heritage through cultural events, educational programs, and 
              community gatherings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-t-4 border-t-blue-600 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  Foster unity among Tamil families and preserve our cultural identity while embracing American values.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-indigo-600 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Values</h3>
                <p className="text-gray-600 leading-relaxed">
                  Excellence in cultural preservation, inclusivity, and commitment to community development.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-600 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create a thriving Tamil community that celebrates heritage while building a brighter future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Photo Gallery Slider */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Photo Gallery
              </span>
            </h2>
            <p className="text-lg text-gray-600">Capturing memories from our vibrant community events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {galleryImages.map((image, index) => (
              <div key={index} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              View Full Gallery <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Events Slider */}
      <section id="events" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Events
              </span>
            </h2>
            <p className="text-lg text-gray-600">Join us for exciting cultural celebrations and community gatherings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {eventImages.map((event, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={event.src}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-lg shadow-lg">
                    <div className="text-xs font-semibold text-blue-600">{event.date}</div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section id="sponsors" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Our Sponsors
              </span>
            </h2>
            <p className="text-lg text-gray-600">Thank you to our generous sponsors who make our events possible</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="relative aspect-square mb-3">
                  <Image
                    src={sponsor.src}
                    alt={sponsor.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{sponsor.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sponsor.level === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                    sponsor.level === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {sponsor.level}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="#contact">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Become a Sponsor <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Become a member today and be part of Jacksonville's vibrant Tamil community!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl px-10 py-6 text-lg">
                <Users className="mr-2 h-5 w-5" />
                Become a Member
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg">
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden">
                  <Image
                    src="/images/JTMLogo.jpg"
                    alt="JTM Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Jacksonville Tamil Mandram</h3>
                  <p className="text-sm text-gray-400">Connecting Communities</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
                A non-profit organization dedicated to preserving Tamil culture and heritage 
                while fostering unity among Tamil families in Jacksonville, Florida.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#home" className="hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link href="#events" className="hover:text-blue-400 transition-colors">Events</Link></li>
                <li><Link href="#gallery" className="hover:text-blue-400 transition-colors">Gallery</Link></li>
                <li><Link href="/auth/register" className="hover:text-blue-400 transition-colors">Membership</Link></li>
                <li><Link href="#sponsors" className="hover:text-blue-400 transition-colors">Sponsors</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Jacksonville, Florida</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span>info@jtm.org</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span>(904) XXX-XXXX</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Jacksonville Tamil Mandram. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

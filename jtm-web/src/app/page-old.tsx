// JTM Web - Landing Page
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
  X,
  ArrowRight,
  Star,
  Award,
  Target
} from 'lucide-react'

// Gallery images
const galleryImages = [
  '/images/gallery/JTM Sangamam.jpeg',
  '/images/gallery/EC2025Team.jpeg',
  '/images/gallery/AnandMemorialTournament.jpeg',
  '/images/gallery/YLC.jpeg',
  '/images/gallery/JTMGuest.jpeg',
  '/images/gallery/Throwball M- Winners.jpeg',
  '/images/gallery/Throwball W-Winners.jpeg',
  '/images/gallery/YLC1.jpeg',
  '/images/gallery/Badminton MIxedDoubles_winner.jpeg',
  '/images/gallery/MenCricketSuper8 Winners.jpeg',
  '/images/gallery/GreetAndMeet_SeenuRamaswamy.jpeg',
  '/images/gallery/Throwball Y-Winners.jpeg',
]

// Event images
const eventImages = [
  { src: '/images/events/jtm2025GalaEvent.jpg', title: 'Gala Event 2025' },
  { src: '/images/events/Pongal Event.jpeg', title: 'Pongal Celebration' },
  { src: '/images/events/jtm2025-TamizhVizha.jpg', title: 'Tamilzh Vizha' },
  { src: '/images/events/jtm25Sangamam.jpg', title: 'Sangamam 2025' },
  { src: '/images/events/jtm2025SportsDay.jpg', title: 'Sports Day' },
  { src: '/images/events/jtm2025KalaiVizha.jpg', title: 'Kalai Vizha' },
  { src: '/images/events/jtm25TamilNewYear3.jpg', title: 'Tamil New Year' },
  { src: '/images/events/jtm2025GreetMeet.jpg', title: 'Greet & Meet' },
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
  { src: '/images/sponsers/Kolapasi.jpeg', name: 'Kolapasi', level: 'Silver' },
  { src: '/images/sponsers/PKJourney.jpeg', name: 'PK Journey', level: 'Silver' },
  { src: '/images/sponsers/Thayver.jpeg', name: 'Thayver', level: 'Silver' },
]

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (user) {
      // Check if user is admin
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

  // Show landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">JTM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Jacksonville Tamil Mandram</h1>
                <p className="text-xs text-gray-600">Connecting Communities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  வணக்கம் Welcome
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Connecting Tamil Families in
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Jacksonville</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Join our vibrant community celebrating Tamil culture, heritage, and traditions. 
                Experience authentic festivals, cultural programs, and build lasting connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href="/auth/register">
                    <Users className="mr-2 h-5 w-5" />
                    Become a Member
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50" asChild>
                  <Link href="#events">
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-orange-600">500+</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">50+</div>
                  <div className="text-sm text-gray-600">Events/Year</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">15+</div>
                  <div className="text-sm text-gray-600">Years</div>
                </div>
              </div>
            </div>

            {/* Right Hero Slider */}
            <div className="relative">
              <HeroSlider />
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-500 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join us for exciting cultural celebrations, festivals, and community gatherings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Event Card 1 */}
            <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 border-0">
              <div className="aspect-[16/9] bg-gradient-to-br from-orange-200 to-red-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Calendar className="h-16 w-16 opacity-50" />
                </div>
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow-lg">
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <div className="text-xs text-gray-600">JAN</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pongal Festival 2025</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Community Hall, Jacksonville
                </div>
                <p className="text-gray-600 mb-4">
                  Celebrate the harvest festival with traditional music, dance, and authentic Tamil cuisine.
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Event Card 2 */}
            <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 border-0">
              <div className="aspect-[16/9] bg-gradient-to-br from-blue-200 to-purple-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Users className="h-16 w-16 opacity-50" />
                </div>
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow-lg">
                  <div className="text-2xl font-bold text-blue-600">28</div>
                  <div className="text-xs text-gray-600">FEB</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cultural Program</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Event Center, Jacksonville
                </div>
                <p className="text-gray-600 mb-4">
                  An evening of classical Bharatanatyam performances and Tamil music concerts.
                </p>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Event Card 3 */}
            <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 border-0">
              <div className="aspect-[16/9] bg-gradient-to-br from-green-200 to-teal-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Sparkles className="h-16 w-16 opacity-50" />
                </div>
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow-lg">
                  <div className="text-2xl font-bold text-green-600">14</div>
                  <div className="text-xs text-gray-600">APR</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tamil New Year</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Riverside Park, Jacksonville
                </div>
                <p className="text-gray-600 mb-4">
                  Welcome the new year with traditional rituals, games, and community feast.
                </p>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Moments
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Capturing memories from our vibrant cultural celebrations
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <GallerySlider />
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join JTM?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be part of a vibrant community that celebrates culture and builds connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cultural Events</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience authentic Tamil festivals including Pongal, Deepavali, Tamil New Year, and cultural performances throughout the year.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Network</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with Tamil families, make lifelong friendships, and build a strong support network in Jacksonville.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cultural Heritage</h3>
              <p className="text-gray-600 leading-relaxed">
                Preserve and pass on Tamil language, arts, music, and traditions to the next generation with pride.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from families who are part of our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      M
                    </div>
                    <div className="ml-3">
                      <h4 className="font-bold text-gray-900">Member Name</h4>
                      <p className="text-sm text-gray-600">Member since 2020</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">
                    "JTM has been instrumental in helping our family stay connected to our Tamil roots. 
                    The cultural events are amazing and our kids love participating!"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Become a member today and be part of Jacksonville's vibrant Tamil community!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 shadow-2xl px-8 py-6 text-lg" asChild>
              <Link href="/auth/register">
                <Users className="mr-2 h-5 w-5" />
                Become a Member
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
              <Link href="/auth/login">
                Sign In to Your Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JTM</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Jacksonville Tamil Mandram</h3>
                  <p className="text-sm text-gray-400">Connecting Communities</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                A non-profit organization dedicated to bringing together Tamil-speaking families 
                in Jacksonville and surrounding areas since 2010.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#events" className="hover:text-orange-400 transition-colors">Events</Link></li>
                <li><Link href="/auth/register" className="hover:text-orange-400 transition-colors">Membership</Link></li>
                <li><Link href="#" className="hover:text-orange-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-orange-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Connect With Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Jacksonville, FL
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Events
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


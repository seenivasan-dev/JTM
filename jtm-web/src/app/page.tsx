// JTM Web - Modern Landing Page
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SponsorsSlider } from '@/components/landing/SponsorsSlider'
import { PublicNav } from '@/components/layout/PublicNav'
import {
  Calendar,
  Users,
  Heart,
  Globe,
  Trophy,
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
  { src: '/images/gallery/EC2025Team.jpeg', title: 'EC 2025 Team' },
  { src: '/images/gallery/JTM Sangamam.jpeg', title: 'JTM Sangamam' },
  { src: '/images/gallery/AnandMemorialTournament.jpeg', title: 'Anand Memorial Tournament' },
  { src: '/images/gallery/YLC.jpeg', title: 'Youth Leadership Camp' },
  { src: '/images/gallery/JTMGuest.jpeg', title: 'Special Guest Visit' },
  { src: '/images/gallery/Throwball M- Winners.jpeg', title: 'Throwball Winners' },
  { src: '/images/gallery/Throwball W-Winners.jpeg', title: 'Women Throwball Champions' },
  { src: '/images/gallery/YLC1.jpeg', title: 'YLC Activities' },
]

// Event images
const eventImages = [
  { src: '/images/events/jtm2025KalaiVizha.jpg', title: 'Kalai Vizha', date: 'Dec 2025' },
  { src: '/images/events/jtm2025GalaEvent.jpg', title: 'Gala Event 2025', date: 'Nov 2025' },
  { src: '/images/events/Pongal Event.jpeg', title: 'Pongal Celebration', date: 'January 2025' },
  { src: '/images/events/jtm2025-TamizhVizha.jpg', title: 'Tamilzh Vizha', date: 'March 2025' },
  { src: '/images/events/jtm25Sangamam.jpg', title: 'Sangamam 2025', date: 'April 2025' },
  { src: '/images/events/jtm2025SportsDay.jpg', title: 'Sports Day', date: 'May 2025' },

]

// Sponsor images
const sponsors = [
  // Platinum Sponsors
  { src: '/images/sponsers/Platinum-Bala.jpg', name: 'Bala', level: 'Platinum' },
  { src: '/images/sponsers/Platinum-Community-Foundation.jpg', name: 'Community Foundation', level: 'Platinum' },
  { src: '/images/sponsers/Platinum-Dr-Kani.jpg', name: 'Dr. Kani', level: 'Platinum' },
  { src: '/images/sponsers/Platinum-Mastercraft.jpg', name: 'Mastercraft', level: 'Platinum' },
  { src: '/images/sponsers/Platinum-Peaky-Blinds.jpg', name: 'Peaky Blinds', level: 'Platinum' },
  { src: '/images/sponsers/Platinum-Sridhar.jpg', name: 'Sridhar', level: 'Platinum' },

  // Gold Sponsors
  { src: '/images/sponsers/Gold-Desi-Pantry.png', name: 'Desi Pantry', level: 'Gold' },
  { src: '/images/sponsers/Gold-Devi.jpg', name: 'Devi', level: 'Gold' },
  { src: '/images/sponsers/Gold-FloridaBlue.jpg', name: 'Florida Blue', level: 'Gold' },
  { src: '/images/sponsers/Gold-Joseph.jpg', name: 'Joseph', level: 'Gold' },
  { src: '/images/sponsers/Gold-Kishek.jpg', name: 'Kishek', level: 'Gold' },
  { src: '/images/sponsers/Gold-Kolapasi.jpg', name: 'Kolapasi', level: 'Gold' },
  { src: '/images/sponsers/Gold-Krish.jpg', name: 'Krish', level: 'Gold' },
  { src: '/images/sponsers/Gold-Sathiyan.jpg', name: 'Sathiyan', level: 'Gold' },

  // Silver Sponsors
  { src: '/images/sponsers/Silver-Manju-FreshMeats.jpg', name: 'Manju Fresh Meats', level: 'Silver' },

  // Bronze Sponsors
  { src: '/images/sponsers/Bronze Sponsor - 1.jpg', name: 'Bronze Sponsor 1', level: 'Bronze' },
  { src: '/images/sponsers/Bronze Sponsor - 2.jpg', name: 'Bronze Sponsor 2', level: 'Bronze' },
  { src: '/images/sponsers/Bronze Sponsor - 3.jpg', name: 'Bronze Sponsor 3', level: 'Bronze' },
  { src: '/images/sponsers/Bronze Sponsor - 4.jpg', name: 'Bronze Sponsor 4', level: 'Bronze' },
  { src: '/images/sponsers/Bronze Sponsor - 5.jpg', name: 'Bronze Sponsor 5', level: 'Bronze' },

  // Event Sponsors
  { src: '/images/sponsers/Event-AshleyHomes.jpg', name: 'Ashley Homes', level: 'Event' },
  { src: '/images/sponsers/Event-Sponsor-ICIHomes.jpeg', name: 'ICI Homes', level: 'Event' },
  { src: '/images/sponsers/Event-Sponsor-Madurai-Kitchen.jpeg', name: 'Madurai Kitchen', level: 'Event' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicNav />

      {/* Hero Banner Section */}
      <section className="relative pt-20 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex justify-center">
        <div className="relative">
          <Image
            src="/images/banner.png"
            alt="Jacksonville Tamil Mandram Community"
            width={1920}
            height={400}
            className="max-w-full h-auto"
            priority
            quality={95}
          />
        </div>
      </section>

      {/* Current EC Team Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, #4F46E5 2px, transparent 2px),
              radial-gradient(circle at 80% 80%, #4F46E5 2px, transparent 2px),
              radial-gradient(circle at 40% 20%, #4F46E5 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 150px 150px, 80px 80px'
          }}></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300 rounded-full opacity-10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header with decorative elements */}
            <div className="text-center mb-12 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>

              <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border-2 border-blue-300 shadow-lg">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold text-sm tracking-wider">LEADERSHIP 2025</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Executive Committee
                </span>
              </h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
                <Trophy className="h-6 w-6 text-indigo-600" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
              </div>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Meet our dedicated leadership team working tirelessly to serve the Tamil community
              </p>
            </div>

            {/* EC Team Photo Container */}
            <div className="relative max-w-5xl mx-auto">
              {/* Decorative corner elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl opacity-60"></div>
              <div className="absolute -top-4 -right-4 w-20 h-20 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl opacity-60"></div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-4 border-r-4 border-purple-500 rounded-br-3xl opacity-60"></div>

              {/* Photo frame with glassmorphism */}
              <div className="relative bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-2xl border-2 border-white">
                <div className="relative rounded-2xl overflow-hidden shadow-xl ring-4 ring-blue-200/50">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src="/images/gallery/EC2025Team.jpeg"
                      alt="Jacksonville Tamil Mandram Executive Committee 2025"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Bottom info bar */}
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-inner">
                  <p className="text-gray-700 text-center leading-relaxed">
                    Our Executive Committee works tirelessly to serve the Tamil community, organize cultural events,
                    and preserve our rich heritage for future generations.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
                <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 shadow-xl px-8 py-6 text-lg">
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">375+</div>
                <div className="text-sm font-medium text-gray-600">Members</div>
              </div>
              <div className="text-center border-x border-gray-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">20+</div>
                <div className="text-sm font-medium text-gray-600">Events/Year</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">25+</div>
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

      {/* History Section */}
      <section id="history" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">History</span>
              </h2>
              <p className="text-lg text-gray-600">A journey of culture, community, and celebration</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">2001</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Founded</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Jacksonville Tamil Mandram was established by a small group of Tamil families with a vision to preserve and promote Tamil culture in Northeast Florida.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">2010</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Non-Profit Registration</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">JTM was officially incorporated as a non-profit organization in Florida, formalizing our commitment to community service and cultural preservation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">2015</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Growth &amp; Expansion</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Membership grew to over 150 families, and JTM launched Tamil language classes for children and expanded annual event programming.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">Today</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Thriving Community</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">With 375+ members and 20+ annual events, JTM continues to be the heart of the Tamil community in Jacksonville, connecting generations through culture.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-50 to-indigo-100 rounded-3xl p-8 border-2 border-indigo-200 shadow-xl">
                  <div className="text-center space-y-6">
                    <div className="text-7xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">25+</div>
                    <div className="text-xl font-semibold text-gray-800">Years of Service</div>
                    <div className="h-px bg-indigo-200"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">375+</div>
                        <div className="text-sm text-gray-600">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">500+</div>
                        <div className="text-sm text-gray-600">Events Held</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"Preserving our heritage, building our future"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tamil Classes Section */}
      <section id="tamil-classes" className="py-20 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tamil Classes</span>
              </h2>
              <p className="text-2xl font-semibold text-gray-700 mb-3">தமிழ் வகுப்புகள்</p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Preserving our language for the next generation</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-cyan-500 hover:shadow-xl transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🌱</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Beginners</h3>
                  <p className="text-sm text-gray-500 mb-1">Ages 5–8</p>
                  <p className="text-gray-600 leading-relaxed text-sm">Introduction to Tamil alphabets, basic vocabulary, and simple sentences through songs and stories.</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">📖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Intermediate</h3>
                  <p className="text-sm text-gray-500 mb-1">Ages 9–13</p>
                  <p className="text-gray-600 leading-relaxed text-sm">Reading, writing, and conversational Tamil with exposure to Tamil literature, poetry, and grammar.</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-indigo-500 hover:shadow-xl transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🎓</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced</h3>
                  <p className="text-sm text-gray-500 mb-1">Ages 14+</p>
                  <p className="text-gray-600 leading-relaxed text-sm">Deep dive into classical Tamil literature, Thirukkural, essay writing, and cultural heritage studies.</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-10 bg-white rounded-2xl border border-indigo-200 shadow-lg p-6 max-w-2xl mx-auto text-center">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Enroll Your Child</h4>
              <p className="text-gray-600 text-sm mb-4">Classes are held every weekend during the school year. JTM members receive priority enrollment.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white">
                    Become a Member to Enroll
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact for Info
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Magazines Section */}
      <section id="magazines" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JTM Magazines</span>
              </h2>
              <p className="text-lg text-gray-600">Our community publications — celebrating culture, stories, and achievements</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { year: '2025', title: 'JTM Souvenir 2025', desc: 'Annual souvenir featuring highlights of JTM events, member stories, and cultural articles from the past year.', color: 'from-cyan-500 to-blue-600' },
                { year: '2024', title: 'JTM Souvenir 2024', desc: 'Celebrating milestones from 2024, including our Pongal celebration, Gala Night, and community service initiatives.', color: 'from-blue-500 to-indigo-600' },
                { year: '2023', title: 'JTM Souvenir 2023', desc: 'A retrospective of JTM\'s vibrant 2023 cultural calendar — Deepavali, sports day, Tamil classes graduation, and more.', color: 'from-indigo-500 to-purple-600' },
              ].map((mag) => (
                <div key={mag.year} className="group rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`bg-gradient-to-br ${mag.color} p-8 aspect-[3/4] flex flex-col items-center justify-center text-white relative`}>
                    <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-6xl font-bold mb-2">{mag.year}</div>
                      <div className="text-sm font-medium opacity-80">Annual Souvenir</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2">{mag.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{mag.desc}</p>
                    <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                      Coming Soon
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Digital copies of JTM magazines are available to members. <Link href="/auth/login" className="text-blue-600 hover:underline">Sign in</Link> to access the archives.
            </p>
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
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700">
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
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/events">
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

          {/* Sponsors Slider - One at a time */}
          <SponsorsSlider sponsors={sponsors} />

          <div className="text-center mt-12">
            <Link href="#contact">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700">
                Become a Sponsor <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-lg text-gray-600">Everything you need to know about JTM membership and events</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: 'Who can join JTM?',
                  a: 'Anyone of Tamil origin or with an interest in Tamil culture living in the Jacksonville, Florida area is welcome to become a member. We offer Individual and Family membership options.',
                },
                {
                  q: 'How much does membership cost?',
                  a: 'Membership fees vary by type. Please register on our platform and submit your payment reference to complete enrollment. Contact us for the current fee schedule.',
                },
                {
                  q: 'How do I RSVP for events?',
                  a: 'Active members can log in to their account and RSVP directly from the Events page. You\'ll receive a confirmation email and, for paid events, a QR code for check-in once your payment is verified.',
                },
                {
                  q: 'Can non-members attend JTM events?',
                  a: 'Some events are open to the public, while others are exclusive to members. Check the individual event details. Non-members are always welcome to join JTM to enjoy full access.',
                },
                {
                  q: 'How do Tamil Classes work?',
                  a: 'Tamil classes run on weekends during the school year. They are open to children of JTM members with priority enrollment. Contact us or become a member to enroll your child.',
                },
                {
                  q: 'How do I renew my membership?',
                  a: 'Log in to your JTM account and navigate to the Renewal section. Submit your new membership type and payment reference. The admin team will review and approve your renewal.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">Q</span>
                    {item.q}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed pl-8">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Contact <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Us</span>
              </h2>
              <p className="text-lg text-gray-600">We&apos;d love to hear from you. Reach out with any questions.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <a href="mailto:jtmec2025@gmail.com" className="text-blue-600 hover:underline text-sm">jtmec2025@gmail.com</a>
                      <p className="text-gray-500 text-xs mt-0.5">We typically respond within 1–2 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Location</div>
                      <div className="text-gray-700 text-sm">Jacksonville, Florida</div>
                      <p className="text-gray-500 text-xs mt-0.5">Northeast Florida area</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Social Media</div>
                      <div className="text-gray-700 text-sm">Follow us on Facebook for event updates</div>
                      <a href="https://www.facebook.com/jacksonvilletamilmandram" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Jacksonville Tamil Mandram</a>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact Form */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h3>
                <form
                  action="mailto:jtmec2025@gmail.com"
                  method="GET"
                  encType="text/plain"
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Full name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      name="subject"
                      type="text"
                      placeholder="How can we help?"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      name="body"
                      rows={4}
                      placeholder="Tell us what you'd like to know..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
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
                  <span>jtmec2025@gmail.com</span>
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

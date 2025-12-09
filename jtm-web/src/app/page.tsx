// JTM Web - Landing Page
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, Sparkles, Heart, Globe, Trophy } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Hero Section with Tamil Cultural Banner */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Tamil Cultural Banner Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/jtm_main_bn.jpg"
            alt="Tamil Cultural Heritage - Bharatanatyam dancers and temples"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo - Beautiful JTM Logo with Glowing Design */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative group">
                {/* Animated glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full opacity-75 blur-2xl group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                {/* Logo circle with actual image */}
                <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-yellow-400/50 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  <Image
                    src="/images/jtmlogo.png"
                    alt="Jacksonville Tamil Mandram Logo"
                    width={140}
                    height={140}
                    className="object-contain p-2"
                    priority
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-3 -right-3 h-10 w-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full animate-bounce shadow-xl border-2 border-white flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 h-8 w-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse shadow-xl"></div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl leading-tight">
              <span className="text-white">
                Jacksonville
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent animate-gradient">
                Tamil Mandram
              </span>
            </h1>

            <p className="text-2xl md:text-3xl lg:text-4xl text-yellow-300 mb-6 font-semibold drop-shadow-lg">
              வணக்கம் - Welcome to Our Community
            </p>
            
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              Connecting Tamil families in Jacksonville, Florida. Join us in celebrating our rich culture,
              heritage, and traditions through vibrant events and community gatherings.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-2xl hover:shadow-orange-500/50 transition-all px-10 py-7 text-lg rounded-2xl border-2 border-yellow-400/30 hover:scale-105" asChild>
                <Link href="/auth/register">
                  <Sparkles className="mr-2 h-6 w-6" />
                  Join Our Community
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-3 border-white text-white hover:bg-white/20 backdrop-blur-sm px-10 py-7 text-lg rounded-2xl shadow-2xl hover:scale-105 transition-all font-semibold" asChild>
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Stats - Enhanced Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="group text-center bg-gradient-to-br from-white via-orange-50 to-white p-8 rounded-3xl shadow-2xl border-2 border-orange-300 hover:scale-105 hover:shadow-orange-500/30 transition-all duration-300 hover:-rotate-1">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                  500+
                </div>
                <div className="text-base font-bold text-gray-800">Active Members</div>
                <div className="text-xs text-gray-600 mt-1">Growing Community</div>
              </div>
              <div className="group text-center bg-gradient-to-br from-white via-yellow-50 to-white p-8 rounded-3xl shadow-2xl border-2 border-yellow-400 hover:scale-105 hover:shadow-yellow-500/30 transition-all duration-300">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  50+
                </div>
                <div className="text-base font-bold text-gray-800">Events/Year</div>
                <div className="text-xs text-gray-600 mt-1">Cultural Celebrations</div>
              </div>
              <div className="group text-center bg-gradient-to-br from-white via-red-50 to-white p-8 rounded-3xl shadow-2xl border-2 border-red-300 hover:scale-105 hover:shadow-red-500/30 transition-all duration-300 hover:rotate-1">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  15+
                </div>
                <div className="text-base font-bold text-gray-800">Years Active</div>
                <div className="text-xs text-gray-600 mt-1">Trusted Legacy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Why Join JTM?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Be part of a vibrant Tamil community that celebrates culture, fosters connections, and creates lasting memories
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="elevated-card border-t-4 border-t-primary hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mb-4 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cultural Events</h3>
                <p className="text-muted-foreground">
                  Experience authentic Tamil festivals including Pongal, Deepavali, Tamil New Year, and cultural performances throughout the year.
                </p>
              </CardContent>
            </Card>

            <Card className="elevated-card border-t-4 border-t-secondary hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-blue-400 flex items-center justify-center mb-4 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Network</h3>
                <p className="text-muted-foreground">
                  Connect with Tamil families, make lifelong friendships, and build a strong support network in Jacksonville.
                </p>
              </CardContent>
            </Card>

            <Card className="elevated-card border-t-4 border-t-accent hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-emerald-400 flex items-center justify-center mb-4 shadow-lg">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cultural Heritage</h3>
                <p className="text-muted-foreground">
                  Preserve and pass on Tamil language, arts, music, and traditions to the next generation with pride.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary via-secondary to-accent p-1 rounded-3xl shadow-2xl">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12">
              <h2 className="text-4xl font-bold mb-6 text-center">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Our Mission
                </span>
              </h2>
              <p className="text-lg text-center text-muted-foreground mb-8">
                Jacksonville Tamil Mandram is a non-profit organization dedicated to bringing together Tamil-speaking 
                people in Jacksonville and surrounding areas. We celebrate our rich cultural heritage while 
                embracing our American home, creating a vibrant community for all generations.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Cultural Preservation</h3>
                  <p className="text-sm text-muted-foreground">Keeping Tamil traditions alive</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Community Building</h3>
                  <p className="text-sm text-muted-foreground">Fostering lasting connections</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">Quality events and programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Become a member today and be part of Jacksonville's vibrant Tamil community!
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl px-8 py-6 text-lg rounded-2xl" asChild>
            <Link href="/auth/register">
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xl">JTM</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Jacksonville Tamil Mandram</h3>
          <p className="text-gray-400 mb-6">
            A non-profit organization connecting Tamil families in Jacksonville, Florida
          </p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Jacksonville Tamil Mandram. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}


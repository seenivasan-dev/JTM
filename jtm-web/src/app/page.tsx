// JTM Web - Landing Page
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-kolam-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl animate-float">
                  <span className="text-white font-bold text-3xl">JTM</span>
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-accent rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Jacksonville
              </span>
              <br />
              <span className="text-foreground">
                Tamil Mandram
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
              வணக்கம் - Welcome to Our Community
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connecting Tamil families in Jacksonville, Florida. Join us in celebrating our rich culture,
              heritage, and traditions through vibrant events and community gatherings.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg rounded-2xl" asChild>
                <Link href="/auth/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Join Our Community
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg rounded-2xl" asChild>
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <div className="text-sm text-muted-foreground">Events/Year</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                  15+
                </div>
                <div className="text-sm text-muted-foreground">Years Active</div>
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


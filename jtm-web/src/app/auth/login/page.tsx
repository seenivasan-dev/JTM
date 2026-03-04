// JTM Web - Login Page
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import Image from 'next/image'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicBottomNav } from '@/components/layout/PublicBottomNav'
import { Calendar, Users, Sparkles } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-indigo-50/40 via-white to-cyan-50/20 dark:bg-gray-900">
      <PublicNav />

      {/* Content area */}
      <div className="lg:min-h-screen lg:flex lg:items-center lg:justify-center lg:px-4 lg:py-8">
        <div className="w-full lg:max-w-6xl lg:grid lg:grid-cols-2 lg:shadow-2xl lg:rounded-2xl overflow-hidden">

          {/* Left Side — desktop branding panel */}
          <div className="hidden lg:flex flex-col relative bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-700 p-10">
            <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full">
              <Link href="/" className="flex items-center space-x-3 mb-12 group">
                <div className="relative">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-2xl group-hover:scale-105 transition-transform">
                    <Image src="/images/JTMLogo.jpg" alt="JTM" fill className="object-cover" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-emerald-400 rounded-full animate-pulse border-2 border-white/30"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white drop-shadow">Jacksonville Tamil Mandram</h1>
                  <p className="text-sm text-white/70 font-medium">Community Management Portal</p>
                </div>
              </Link>

              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">வணக்கம்</h2>
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow">Welcome Back!</h3>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Sign in to access your account, manage your profile, register for events,
                    and stay connected with our vibrant Tamil community in Jacksonville.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Cultural Events', desc: 'Register for Pongal, Deepavali, and more' },
                    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', title: 'Community Network', desc: 'Connect with Tamil families' },
                    { icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Member Benefits', desc: 'Exclusive access to programs' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-sm text-white/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white/50 text-xs mt-8">Connecting Tamil families in Jacksonville, Florida</p>
            </div>
          </div>

          {/* Right Side — form */}
          <div className="flex flex-col dark:bg-gray-900">
            {/* Mobile-only branded hero */}
            <div className="lg:hidden bg-gradient-to-b from-cyan-600 via-blue-700 to-indigo-700 px-6 pt-10 pb-16 text-white text-center relative overflow-hidden rounded-b-[2.5rem]">
              <div className="absolute inset-0 bg-kolam-pattern opacity-10" />
              <div className="relative z-10">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-2xl mx-auto mb-4">
                  <Image src="/images/JTMLogo.jpg" alt="Jacksonville Tamil Mandram" fill className="object-cover" />
                </div>
                <h2 className="text-4xl font-bold mb-1 drop-shadow-lg">வணக்கம்</h2>
                <p className="text-lg font-semibold text-white/90">Jacksonville Tamil Mandram</p>
                <p className="text-sm text-cyan-100 mt-0.5">Member Portal</p>
              </div>
            </div>

            {/* Form — overlaps hero on mobile with -mt-8 */}
            <div className="lg:hidden px-5 -mt-8 relative z-10 pb-4">
              <div className="w-full">
                <LoginForm />
              </div>
            </div>

            {/* Desktop form */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 pb-12">
              <div className="w-full">
                <LoginForm />
              </div>
            </div>

            {/* Mobile-only community feature tiles */}
            <div className="lg:hidden px-5 pb-6 pt-2">
              <p className="text-xs text-center text-gray-400 font-semibold mb-3 uppercase tracking-wider">Why Join JTM?</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-cyan-100 flex flex-col items-center text-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Cultural Events</p>
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Pongal, Deepavali & more</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-violet-100 flex flex-col items-center text-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Tamil Community</p>
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">200+ families connected</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-amber-100 flex flex-col items-center text-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Member Benefits</p>
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Exclusive programs & access</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <PublicBottomNav />
    </div>
  )
}

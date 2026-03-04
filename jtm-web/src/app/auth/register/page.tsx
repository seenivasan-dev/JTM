import RegistrationForm from '@/components/auth/RegistrationForm'
import Link from 'next/link'
import Image from 'next/image'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicBottomNav } from '@/components/layout/PublicBottomNav'
import { Calendar, Users, BookOpen, Star } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-violet-50/30 via-white to-indigo-50/20 dark:bg-gray-900">
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
                  <p className="text-sm text-white/70 font-medium">Join Our Community</p>
                </div>
              </Link>

              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">வரவேற்கிறோம்</h2>
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow">Join Our Community!</h3>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Become a member of Jacksonville&apos;s vibrant Tamil community. Connect with families,
                    celebrate our culture, and create lasting memories together.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    { title: 'Exclusive Events Access', desc: 'Pongal, Deepavali, and cultural programs' },
                    { title: 'Community Network', desc: 'Connect with Tamil families in Jacksonville' },
                    { title: 'Cultural Heritage', desc: 'Preserve Tamil traditions for the next generation' },
                    { title: 'Family Programs', desc: 'Activities for all ages and interests' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                <h2 className="text-4xl font-bold mb-1 drop-shadow-lg">வரவேற்கிறோம்</h2>
                <p className="text-lg font-semibold text-white/90">Jacksonville Tamil Mandram</p>
                <p className="text-sm text-cyan-100 mt-0.5">Join Our Community</p>
              </div>
            </div>

            {/* Mobile: membership benefits card + form (overlaps hero with -mt-8) */}
            <div className="lg:hidden px-5 -mt-8 relative z-10 pb-6 space-y-4">

              {/* Membership includes card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Membership Includes</p>
                </div>
                <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100">
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">Cultural Events</p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Pongal, Deepavali & more</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">Family Network</p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">200+ Tamil families</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">Heritage Programs</p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Language & arts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">Kids Activities</p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Programs for all ages</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration form */}
              <div className="w-full">
                <RegistrationForm />
              </div>
            </div>

            {/* Desktop form */}
            <div className="hidden lg:flex items-start justify-center px-5 py-8 pb-12 lg:p-12 lg:items-center">
              <div className="w-full">
                <RegistrationForm />
              </div>
            </div>
          </div>

        </div>
      </div>

      <PublicBottomNav />
    </div>
  )
}

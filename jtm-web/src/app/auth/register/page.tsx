import RegistrationForm from '@/components/auth/RegistrationForm';
import Link from 'next/link'
import { PublicNav } from '@/components/layout/PublicNav'

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-20 dark:bg-gray-900">
      <PublicNav />

      {/* Content area */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 lg:min-h-screen lg:flex lg:items-center lg:justify-center lg:px-4 lg:py-8">
        <div className="w-full lg:max-w-6xl lg:grid lg:grid-cols-2 lg:shadow-2xl lg:rounded-2xl overflow-hidden">

          {/* Left Side — desktop branding panel */}
          <div className="hidden lg:flex flex-col relative bg-gradient-to-r from-blue-600 to-blue-700 p-10">
            <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full">
              <Link href="/" className="flex items-center space-x-3 mb-12 group">
                <div className="relative">
                  <div className="h-16 w-16 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">JTM</span>
                  </div>
                  <div className="absolute -top-2 -right-2 h-5 w-5 bg-emerald-400 rounded-full animate-pulse"></div>
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
                    Become a member of Jacksonville's vibrant Tamil community. Connect with families,
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
          <div className="flex items-start justify-center bg-gray-50 dark:bg-gray-900 px-5 py-8 lg:p-12 lg:items-center">
            <div className="w-full">
              <RegistrationForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

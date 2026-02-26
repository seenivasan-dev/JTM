// JTM Web - Login Page
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import { PublicNav } from '@/components/layout/PublicNav'

export default function LoginPage() {
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
          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-5 py-8 lg:p-12">
            <div className="w-full">
              <LoginForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// JTM Web - Login Page
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:flex flex-col space-y-8 relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-kolam-pattern opacity-5"></div>
            
            <div className="relative z-10">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 mb-12 group">
                <div className="relative">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-orange-600 via-blue-600 to-emerald-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">JTM</span>
                  </div>
                  <div className="absolute -top-2 -right-2 h-5 w-5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Jacksonville Tamil Mandram
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Community Management Portal
                  </p>
                </div>
              </Link>

              {/* Welcome Message */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                      வணக்கம்
                    </span>
                  </h2>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome Back!
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Sign in to access your account, manage your profile, register for events, 
                    and stay connected with our vibrant Tamil community in Jacksonville.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Cultural Events</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Register for Pongal, Deepavali, and more</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-blue-400 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Community Network</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Connect with Tamil families</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-emerald-400 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Member Benefits</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Exclusive access to programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

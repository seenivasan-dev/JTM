import RegistrationForm from '@/components/auth/RegistrationForm';
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 items-stretch shadow-2xl rounded-2xl overflow-hidden">
          {/* Left Side - Gradient Branding Panel */}
          <div className="hidden lg:flex flex-col relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-10">
            <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 mb-12 group">
                <div className="relative">
                  <div className="h-16 w-16 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">JTM</span>
                  </div>
                  <div className="absolute -top-2 -right-2 h-5 w-5 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white drop-shadow">
                    Jacksonville Tamil Mandram
                  </h1>
                  <p className="text-sm text-white/70 font-medium">
                    Join Our Community
                  </p>
                </div>
              </Link>

              {/* Welcome Message */}
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">
                    வரவேற்கிறோம்
                  </h2>
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow">
                    Join Our Community!
                  </h3>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Become a member of Jacksonville's vibrant Tamil community. Connect with families,
                    celebrate our culture, and create lasting memories together.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Exclusive Events Access</h4>
                      <p className="text-sm text-white/70">Pongal, Deepavali, and cultural programs</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Community Network</h4>
                      <p className="text-sm text-white/70">Connect with Tamil families in Jacksonville</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Cultural Heritage</h4>
                      <p className="text-sm text-white/70">Preserve Tamil traditions for the next generation</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Family Programs</h4>
                      <p className="text-sm text-white/70">Activities for all ages and interests</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer tagline */}
              <p className="text-white/50 text-xs mt-8">Connecting Tamil families in Jacksonville, Florida</p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex items-center justify-center bg-white dark:bg-gray-900 p-8 lg:p-12">
            <div className="w-full">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">JTM</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Jacksonville Tamil Mandram</div>
                  <div className="text-xs text-gray-500">Member Portal</div>
                </div>
              </div>
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

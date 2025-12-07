import RegistrationForm from '@/components/auth/RegistrationForm';
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:flex flex-col space-y-8 relative order-2 lg:order-1">
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
                    Join Our Community
                  </p>
                </div>
              </Link>

              {/* Welcome Message */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                      வரவேற்கிறோம்
                    </span>
                  </h2>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Join Our Community!
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Become a member of Jacksonville's vibrant Tamil community. Connect with families, 
                    celebrate our culture, and create lasting memories together.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Exclusive Events Access</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Pongal, Deepavali, and cultural programs</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-blue-400 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Community Network</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Connect with Tamil families in Jacksonville</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-emerald-400 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Cultural Heritage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Preserve Tamil traditions for next generation</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Family Programs</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Activities for all ages and interests</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex items-center justify-center order-1 lg:order-2">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </div>
  )
}

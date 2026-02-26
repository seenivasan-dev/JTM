import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'
import { PublicNav } from '@/components/layout/PublicNav'

export default function ForgotPasswordPage() {
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
                  <h2 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">கடவுச்சொல்</h2>
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow">Forgot Password?</h3>
                  <p className="text-lg text-white/80 leading-relaxed">
                    No worries! Enter your email address and we&apos;ll send you a secure link
                    to reset your password and regain access to your account.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Email Verification', desc: 'A secure reset link sent to your inbox' },
                    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure Reset', desc: 'Link expires in 1 hour for security' },
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Account Protection', desc: 'Your account security is our priority' },
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
              <ForgotPasswordForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

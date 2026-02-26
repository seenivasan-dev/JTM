// JTM Web - Offline Fallback Page
import Image from 'next/image'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-xl ring-4 ring-blue-200">
            <Image
              src="/images/JTMLogo.jpg"
              alt="Jacksonville Tamil Mandram"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
          <div className="text-5xl mb-4">📡</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re Offline</h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            This page isn&apos;t available offline. Please check your internet connection and try again.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Some previously visited pages may still be accessible — try navigating back.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Go to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">Jacksonville Tamil Mandram</p>
      </div>
    </div>
  )
}

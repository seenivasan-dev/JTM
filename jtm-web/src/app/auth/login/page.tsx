// JTM Web - Login Page
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="h-6 w-6 rounded-full bg-white mr-2 flex items-center justify-center">
            <span className="text-slate-900 font-bold text-xs">JTM</span>
          </div>
          JTM Community Platform
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This platform has revolutionized how we manage our community events and member engagement."
            </p>
            <footer className="text-sm">Community Administrator</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
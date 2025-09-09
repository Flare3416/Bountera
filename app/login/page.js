'use client';
import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import SakuraPetals from '@/components/SakuraPetals';

const Login = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 relative overflow-hidden">
      {/* Sakura Petals Background */}
      <SakuraPetals />

      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        {/* Back to Home Button */}
        <button 
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-pink-200 text-pink-600 hover:bg-white/80 hover:text-pink-700 transition-all duration-300 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-md space-y-8">
          {/* Header Card */}
          <div className="text-center mb-8 p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="mb-4">
              <div className="text-4xl mb-2">🌸</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-2">
                Bountera
              </h1>
              <p className="text-pink-700/80 text-lg font-medium">
                Welcome Creator
              </p>
            </div>
            <p className="text-pink-600/70">
              Get started to access exclusive bounties and join our community
            </p>
          </div>

          {/* Authentication Buttons */}
          <div className="space-y-4">
            <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" onClick={() => signIn("google", { callbackUrl: "/profile-setup" }) }>
              <div className="flex items-center justify-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white/95 transition-all duration-300">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-pink-700 font-semibold">Continue with Google</span>
              </div>
            </button>
            <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" onClick={() => signIn("github", { callbackUrl: "/profile-setup" })}>
              <div className="flex items-center justify-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white/95 transition-all duration-300">
                <svg className="w-6 h-6 mr-3" fill="#24292e" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-pink-700 font-semibold">Continue with Github</span>
              </div>
            </button>

            {/* <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white/95 transition-all duration-300">
                <svg className="w-6 h-6 mr-3" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-pink-700 font-semibold">Continue with LinkedIn</span>
              </div>
            </button>

            <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white/95 transition-all duration-300">
                <svg className="w-6 h-6 mr-3" fill="#1DA1F2" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="text-pink-700 font-semibold">Continue with Twitter</span>
              </div>
            </button>

            <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white/95 transition-all duration-300">
                <svg className="w-6 h-6 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-pink-700 font-semibold">Continue with Facebook</span>
              </div>
            </button> */}


            {/* <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white/95 transition-all duration-300">
                <svg className="w-6 h-6 mr-3" fill="#000000" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-pink-700 font-semibold">Continue with Apple</span>
              </div>
            </button> */}
          </div>

          {/* Footer */}
          <div className="text-center pt-6">
            <p className="text-pink-600/60 text-sm">
              By continuing, you agree to Bountera's{' '}
              <span className="text-pink-600 hover:text-pink-700 cursor-pointer underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-pink-600 hover:text-pink-700 cursor-pointer underline">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

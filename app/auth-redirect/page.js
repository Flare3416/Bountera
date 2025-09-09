'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getAllUserData } from '@/utils/userData';
import SakuraPetals from '@/components/SakuraPetals';

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }

    // Check if user has existing profile data
    const userData = getAllUserData(session);
    
    if (userData && userData.name && userData.skills && userData.skills.length > 0) {
      // User has complete profile data, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User needs to complete profile setup
      router.push('/profile-setup');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
      {/* Sakura Petals Background */}
      <SakuraPetals />
      
      <div className="text-center relative z-10">
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
          <div className="text-4xl mb-4">🌸</div>
          <h1 className="text-2xl font-bold text-pink-700 mb-2">Welcome back!</h1>
          <p className="text-pink-600">
            {status === 'loading' ? 'Checking your profile...' : 'Redirecting you to the right place...'}
          </p>
          <div className="mt-4">
            <div className="inline-block w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

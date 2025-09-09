'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getAllUserData, hasUserRole, getUserRole, setUserRole } from '@/utils/userData';
import SakuraPetals from '@/components/SakuraPetals';
import RoleSelectionModal from '@/components/RoleSelectionModal';

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user has selected a role
    if (!hasUserRole(session)) {
      setShowRoleModal(true);
      return;
    }

    // Get user role and redirect accordingly
    const userRole = getUserRole(session);
    const userData = getAllUserData(session);
    
    if (userRole === 'bounty_poster') {
      // Check if bounty poster has completed basic profile
      if (userData && userData.name && userData.profileCompleted) {
        router.push('/bounty-dashboard');
      } else {
        router.push('/bounty-poster-setup');
      }
    } else if (userRole === 'creator') {
      // Creators go through the normal flow
      if (userData && userData.name && userData.skills && userData.skills.length > 0) {
        router.push('/dashboard');
      } else {
        router.push('/profile-setup');
      }
    }
  }, [session, status, router]);

  const handleRoleSelect = (role) => {
    if (session?.user?.email) {
      setUserRole(session.user.email, role);
      
      // Redirect based on role
      if (role === 'bounty_poster') {
        router.push('/bounty-poster-setup');
      } else if (role === 'creator') {
        router.push('/profile-setup');
      }
    }
    setShowRoleModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
      {/* Sakura Petals Background */}
      <SakuraPetals />
      
      {/* Role Selection Modal */}
      <RoleSelectionModal 
        isOpen={showRoleModal}
        onRoleSelect={handleRoleSelect}
        onClose={() => setShowRoleModal(false)}
      />
      
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

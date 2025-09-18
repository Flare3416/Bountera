'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  setupNewUser, 
  getUserByEmail, 
  hasUserRole, 
  getUserRole, 
  updateUserRole,
  addToLeaderboard 
} from '@/utils/authMongoDB';
import SakuraPetals from '@/components/SakuraPetals';
import RoleSelectionModal from '@/components/RoleSelectionModal';

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    handleAuthRedirect();
  }, [session, status, router]);

  const handleAuthRedirect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Setup new user if they don't exist in database
      const user = await setupNewUser(session);
      
      // Check if user has selected a role
      if (!user.role) {
        setShowRoleModal(true);
        setIsLoading(false);
        return;
      }

      // Redirect based on role and profile completion
      if (user.role === 'bounty_poster') {
        if (user.profileCompleted) {
          router.push('/bounty-dashboard');
        } else {
          router.push('/bounty-poster-setup');
        }
      } else if (user.role === 'creator') {
        if (user.skills && user.skills.length > 0) {
          router.push('/dashboard');
        } else {
          router.push('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Error during auth redirect:', error);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    try {
      if (session?.user?.email) {
        await updateUserRole(session.user.email, role);
        
        // If user is a creator, add them to leaderboard
        if (role === 'creator') {
          await addToLeaderboard(session.user.email);
        }
        
        // Redirect based on role
        if (role === 'bounty_poster') {
          router.push('/bounty-poster-setup');
        } else if (role === 'creator') {
          router.push('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      setError('Failed to set user role. Please try again.');
    }
    setShowRoleModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-pink-700 mb-2">
            {showRoleModal ? 'Choose Your Role' : 'Welcome!'}
          </h1>
          <p className="text-pink-600">
            {error ? error : 
             isLoading ? 'Setting up your account...' : 
             'Redirecting you to the right place...'}
          </p>
          {!error && (
            <div className="mt-4">
              <div className="inline-block w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {error && (
            <button 
              onClick={handleAuthRedirect}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

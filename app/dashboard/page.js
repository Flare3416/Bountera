'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BountyHunterNavbar from '@/components/BountyHunterNavbar';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import BountyHunterDashboard from '@/components/BountyHunterDashboard';
import BountyPosterDashboard from '@/components/BountyPosterDashboard';
import { getUserRole } from '@/utils/userData';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle authentication and role determination
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Get user role
    const role = getUserRole(session);
    setUserRole(role);
    setIsLoading(false);
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Render appropriate navbar and dashboard based on user role */}
      {userRole === 'bounty_poster' ? (
        <>
          <BountyPosterNavbar />
          <BountyPosterDashboard />
        </>
      ) : (
        <>
          <BountyHunterNavbar />
          <BountyHunterDashboard />
        </>
      )}
    </>
  );
};

export default Dashboard;

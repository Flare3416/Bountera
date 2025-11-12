'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import BountyPosterDashboard from '@/components/BountyPosterDashboard';
import { getUserRole } from '@/utils/userData';

const BountyPosterDashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  // Redirect if not authenticated or not a bounty poster
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const role = getUserRole(session);
    setUserRole(role);
    if (role !== 'bounty_poster') {
      router.push('/dashboard'); // Redirect to regular dashboard
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || (session && userRole === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center" style={{backgroundColor: '#f3f0ff'}}>
        <div className="text-center relative z-10">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <div className="text-4xl mb-4">💼</div>
            <h1 className="text-2xl font-bold text-purple-700 mb-2">Loading...</h1>
            <p className="text-purple-600">Please wait while we load your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bounty Poster Navbar */}
      <BountyPosterNavbar />
      
      {/* Bounty Poster Dashboard */}
      <BountyPosterDashboard />
    </>
  );
};

export default BountyPosterDashboardPage;

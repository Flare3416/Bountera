'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import PurplePetals from '@/components/PurplePetals';
import BountyCard from '@/components/BountyCard';
import { getUserDisplayName, getUserRole, getAllUserData } from '@/utils/userData';
import { getUserBounties, deleteBounty, getAllBounties, updateExpiredBounties, getBountyExpirationInfo } from '@/utils/bountyData';
import { getUserActivities, logActivity, ACTIVITY_TYPES } from '@/utils/activityData';

const BountyPosterDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userBounties, setUserBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Load user bounties
  useEffect(() => {
    if (session?.user?.email) {
      // Update expired bounties first
      updateExpiredBounties();
      
      const bounties = getUserBounties(session.user.email);
      
      // Filter to show open, completed, and in-progress bounties by default (exclude expired)
      const activeBounties = bounties.filter(bounty => {
        const { isExpired } = getBountyExpirationInfo(bounty.deadline);
        
        // Show all status types except expired bounties
        return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
      });
      
      setUserBounties(activeBounties);
      setLoading(false);
    }
  }, [session]);

  // Refresh bounties when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
        const bounties = getUserBounties(session.user.email);
        
        // Filter to show open, completed, and in-progress bounties by default (exclude expired)
        const activeBounties = bounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          
          // Show all status types except expired bounties
          return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
        });
        
        setUserBounties(activeBounties);
      }
    };

    const handleFocus = () => {
      if (session?.user?.email) {
        const bounties = getUserBounties(session.user.email);
        
        // Filter to show open, completed, and in-progress bounties by default (exclude expired)
        const activeBounties = bounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          
          // Show all status types except expired bounties
          return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
        });
        
        setUserBounties(activeBounties);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session?.user?.email]);

  // Handler functions for bounty actions
  const handleEditBounty = (bountyId) => {
    router.push(`/create-bounty?edit=${bountyId}`);
  };

  const handleDeleteBounty = (bountyId) => {
    if (window.confirm('Are you sure you want to delete this bounty?')) {
      // Get bounty details for activity logging before deletion
      const bountyToDelete = userBounties.find(b => b.id === bountyId);
      
      const success = deleteBounty(bountyId, session.user.email);
      if (success) {
        // Log the activity
        if (bountyToDelete) {
          logActivity(
            session.user.email,
            ACTIVITY_TYPES.BOUNTY_DELETED,
            { 
              bountyTitle: bountyToDelete.title,
              bountyId: bountyId
            }
          );
        }
        
        // Refresh the bounties list (show active bounties: open, completed, in-progress)
        const bounties = getUserBounties(session.user.email);
        const activeBounties = bounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          
          // Show all status types except expired bounties
          return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
        });
        setUserBounties(activeBounties);
        alert('Bounty deleted successfully!');
      } else {
        alert('Failed to delete bounty.');
      }
    }
  };

  const handleApplyToBounty = (bountyId) => {
    // This shouldn't be used for bounty posters, but included for completeness
    router.push(`/bounty-application/${bountyId}`);
  };

  // Redirect if not authenticated or not a bounty poster
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole(session);
    setUserRole(userRole);
    if (userRole !== 'bounty_poster') {
      router.push('/dashboard'); // Redirect to regular dashboard
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || (session && userRole === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center" style={{backgroundColor: '#f3f0ff'}}>
        <PurplePetals />
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

  const userDisplayName = getUserDisplayName(session);
  const userData = getAllUserData(session);



  // Calculate stats using all bounties (not just open ones)
  const allUserBounties = getUserBounties(session.user.email);
  const totalBounties = allUserBounties.length;
  const totalApplications = allUserBounties.reduce((sum, bounty) => sum + (bounty.applicants?.length || 0), 0);
  const completedBounties = allUserBounties.filter(bounty => bounty.status === 'completed').length;
  const totalSpent = allUserBounties
    .filter(bounty => bounty.status === 'completed')
    .reduce((sum, bounty) => {
      const budget = parseFloat(bounty.budget) || 0;
      return sum + budget;
    }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden" style={{backgroundColor: '#f3f0ff'}}>
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Purple Petals Background */}
      <PurplePetals />

      {/* Main Content */}
      <div className="relative z-20 p-6 pt-20">
        {/* Profile Banner Section */}
        {userData && (
          <div className="max-w-6xl mx-auto mb-8 mt-12">
            <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 bg-gradient-to-r from-purple-600 to-purple-400 overflow-hidden">
                {userData.bannerImage ? (
                  <Image
                    src={userData.bannerImage}
                    alt="Profile Banner"
                    width={800}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="/defaultbanner.jpeg"
                    alt="Default Profile Banner"
                    width={800}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Profile Info */}
              <div className="p-6 relative -mt-16">
                <div className="flex items-end space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg bg-white overflow-hidden">
                      {userData.profileImage ? (
                        <Image
                          src={userData.profileImage}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src="/defaultpfp.jpg"
                          alt="Default Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1 min-w-0 pt-12">
                    <h1 className="text-2xl font-bold text-purple-700 truncate">
                      {userData.name || userDisplayName}
                    </h1>
                    {userData.companyName && (
                      <p className="text-purple-600 font-medium mt-1 truncate">
                        {userData.companyName}
                      </p>
                    )}
                    {userData.bio && (
                      <p className="text-purple-500 mt-2 text-sm overflow-hidden text-ellipsis line-clamp-2" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {userData.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Edit Profile Button */}
                  <div className="flex-shrink-0 pb-4">
                    <button
                      onClick={() => router.push('/bounty-poster-setup')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 text-sm font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <div className="text-5xl mb-4">💼</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-4">
              Welcome back, {userDisplayName}!
            </h1>
            <p className="text-purple-600 text-lg">
              Ready to post some exciting bounties and find talented creators?
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Post New Bounty */}
            <div 
              onClick={() => router.push('/create-bounty')}
              className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">Set Up Bounty</h3>
                <p className="text-purple-600 mb-4">Create a new project and find the right talent</p>
                <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 group-hover:shadow-lg">
                  Create Bounty
                </div>
              </div>
            </div>

            {/* Active Bounties */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => router.push('/my-bounties')}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">Active Bounties</h3>
                <p className="text-purple-600 mb-4">Manage your ongoing projects</p>
                <div className="text-2xl font-bold text-purple-600">
                  {userBounties.filter(bounty => {
                    const { isExpired } = getBountyExpirationInfo(bounty.deadline);
                    return bounty.status === 'open' && !isExpired;
                  }).length}
                </div>
                <p className="text-sm text-purple-500">Open & Active</p>
              </div>
            </div>

            {/* Find Creators */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👥</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">Browse Creators</h3>
                <p className="text-purple-600 mb-4">Discover talented creators for your projects</p>
                <button onClick={() => router.push('/leaderboard')} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300">
                  View Creators
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Your Dashboard Overview</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{totalBounties}</div>
                <p className="text-purple-500">Total Bounties</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{totalApplications}</div>
                <p className="text-purple-500">Applications</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{completedBounties}</div>
                <p className="text-purple-500">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">${(Number(totalSpent) || 0).toFixed(2)}</div>
                <p className="text-purple-500">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Bounties Section */}
        <div className="max-w-6xl mx-auto">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-700">My Bounties</h2>
              <Link href="/create-bounty">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                  + Create New Bounty
                </button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-purple-600">Loading your bounties...</p>
              </div>
            ) : userBounties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-purple-600 mb-2">No Bounties Yet</h3>
                <p className="text-purple-500 mb-6">Start by creating your first bounty to find talented creators</p>
                <Link href="/create-bounty">
                  <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300">
                    Create Your First Bounty
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBounties.map((bounty) => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    isOwner={true}
                    userRole={userRole}
                    onEdit={handleEditBounty}
                    onDelete={handleDeleteBounty}
                    onApply={handleApplyToBounty}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyPosterDashboard;

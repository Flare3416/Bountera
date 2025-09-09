'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import PurplePetals from '@/components/PurplePetals';
import { getUserDisplayName, getUserRole, getAllUserData } from '@/utils/userData';

const BountyPosterDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a bounty poster
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole(session);
    if (userRole !== 'bounty_poster') {
      router.push('/dashboard'); // Redirect to regular dashboard
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
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
                  <img
                    src={userData.bannerImage}
                    alt="Profile Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl text-white/80 mb-2">💼</div>
                      <p className="text-white/70 text-lg">Your Business Profile</p>
                    </div>
                  </div>
                )}
                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Profile Info */}
              <div className="p-6 relative -mt-16">
                <div className="flex items-end space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden">
                      {userData.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                          <div className="text-purple-600 text-2xl">💼</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1 min-w-0 pb-2">
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
                  <div className="flex-shrink-0 pb-2">
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
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">Active Bounties</h3>
                <p className="text-purple-600 mb-4">Manage your ongoing projects</p>
                <div className="text-2xl font-bold text-purple-600">0</div>
                <p className="text-sm text-purple-500">Coming Soon</p>
              </div>
            </div>

            {/* Find Creators */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👥</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">Browse Creators</h3>
                <p className="text-purple-600 mb-4">Discover talented creators for your projects</p>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300">
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
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-purple-500">Total Bounties</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-purple-500">Applications</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-purple-500">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">$0</div>
                <p className="text-purple-500">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="max-w-6xl mx-auto">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">Recent Activity</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-purple-600 mb-2">No Activity Yet</h3>
              <p className="text-purple-500 mb-6">Start by posting your first bounty to see activity here</p>
              <button 
                onClick={() => router.push('/create-bounty')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300"
              >
                Set Up Your First Bounty
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyPosterDashboard;

'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserDisplayName, getUserProfileImage, getUserBackgroundImage, getAllUserData } from '@/utils/userData';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userBackgroundImage = getUserBackgroundImage(session);
  const userDisplayName = getUserDisplayName(session);
  const userProfileImage = getUserProfileImage(session);
  const userData = getAllUserData(session);

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 relative overflow-hidden">
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Profile Banner Section (like YouTube) */}
      {userBackgroundImage && (
        <div className="relative mt-16 h-64 overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${userBackgroundImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
          </div>
        </div>
      )}

      {/* Sakura Petals Background */}
      <SakuraPetals />

      {/* Main Content */}
      <div className={`relative z-20 p-6 ${userBackgroundImage ? '' : 'pt-20'}`}>
        {/* Welcome Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-2">
                Welcome back, {userDisplayName}! 🎉
              </h1>
              <p className="text-pink-600 text-lg">Ready to discover amazing bounties and showcase your talents?</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center border-4 border-pink-200 overflow-hidden">
                {userProfileImage ? (
                  <img 
                    src={userProfileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-white">👤</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">{userDisplayName}</h3>
              <p className="text-pink-600 text-sm mb-4">{session.user?.email}</p>
              
              {/* User Skills */}
              {userData?.skills && userData.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-pink-600 text-xs font-medium mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {userData.skills.slice(0, 2).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-xs rounded-full"
                      >
                        {skill.split(' ')[0]} {/* Show only emoji and first word */}
                      </span>
                    ))}
                    {userData.skills.length > 2 && (
                      <span className="inline-block px-2 py-1 bg-pink-200 text-pink-600 text-xs rounded-full">
                        +{userData.skills.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => router.push('/view-profile')}
                  className="flex-1 px-3 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors text-sm"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => router.push('/profile-setup')}
                  className="flex-1 px-3 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium hover:bg-pink-200 transition-colors text-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Bounties Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">My Bounties</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Active:</span>
                  <span className="font-bold text-pink-700">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Completed:</span>
                  <span className="font-bold text-pink-700">0</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/bounties')}
                className="mt-4 px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
              >
                Browse Bounties
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Rank:</span>
                  <span className="font-bold text-pink-700">#--</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Points:</span>
                  <span className="font-bold text-pink-700">0</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/leaderboard')}
                className="mt-4 px-4 py-2 rounded-lg bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 transition-colors"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <h3 className="text-2xl font-bold text-pink-700 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-pink-600 text-lg">Welcome to Bountera!</p>
              <p className="text-pink-500">Start by exploring bounties and showcasing your skills.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserDisplayName, getUserProfileImage, getUserBackgroundImage, getAllUserData, getUserRole, getUserData } from '@/utils/userData';
import { getApplicationsForUser } from '@/utils/applicationData';
import { getUserPoints, getUserRank, awardDailyLoginPoints, migrateExistingDataPoints } from '@/utils/pointsSystem';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userBackgroundImage = getUserBackgroundImage(session);
  const userDisplayName = getUserDisplayName(session);
  const userProfileImage = getUserProfileImage(session);
  const userData = getAllUserData(session);

  // State for user stats
  const [userStats, setUserStats] = useState({
    applications: { active: 0, completed: 0 },
    points: 0,
    rank: null
  });

  // Load user statistics
  useEffect(() => {
    const loadStats = () => {
      if (session?.user?.email) {
        // Run migration for existing data (only runs once)
        migrateExistingDataPoints();
        
        // Award daily login points
        awardDailyLoginPoints(session.user.email);
        
        // Small delay to ensure migration completes
        setTimeout(() => {
          // Get user applications
          const applications = getApplicationsForUser(session.user.email);
          const activeApplications = applications.filter(app => 
            app.status === 'pending' || app.status === 'accepted'
          ).length;
          const completedApplications = applications.filter(app => 
            app.status === 'completed'
          ).length;

          // Get user points and rank (fresh from localStorage)
          const points = getUserPoints(session.user.email);
          const rank = getUserRank(session.user.email);

          console.log('Dashboard stats update:', { activeApplications, completedApplications, points, rank });

          setUserStats({
            applications: { 
              active: activeApplications, 
              completed: completedApplications 
            },
            points,
            rank
          });
        }, 100);
      }
    };

    loadStats();
  }, [session?.user?.email]);

  // Handle authentication and role redirect in useEffect
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Check user role - if bounty poster, redirect to their dashboard
    const userRole = getUserRole(session);
    if (userRole === 'bounty_poster') {
      router.push('/bounty-dashboard');
      return;
    }
  }, [status, session, router]);

  if (status === 'loading') {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 relative overflow-hidden">
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Sakura Petals Background */}
      <SakuraPetals />

      {/* Main Content */}
      <div className="relative z-20 p-6 pt-20">
        {/* Profile Banner Section */}
        {userData && (
          <div className="max-w-6xl mx-auto mb-8 mt-12">
            <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-400 overflow-hidden">
                {userData.bannerImage || userBackgroundImage ? (
                  <Image
                    src={userData.bannerImage || userBackgroundImage}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
              </div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6 relative -mt-12">
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 rounded-full border-4 border-pink-500 shadow-xl bg-white overflow-hidden">
                      {userProfileImage || userData.profileImage ? (
                        <Image
                          src={userProfileImage || userData.profileImage}
                          alt="Profile"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src="/defaultpfp.jpg"
                          alt="Default Profile"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1 min-w-0 pt-12">
                    <h1 className="text-2xl font-bold text-pink-700 truncate mb-1">
                      {userData.name || userDisplayName}
                    </h1>
                    
                    {/* User Skills */}
                    {userData?.skills && userData.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {userData.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-sm rounded-full font-medium shadow-sm"
                            >
                              {skill.length > 15 ? skill.substring(0, 15) + '...' : skill}
                            </span>
                          ))}
                          {userData.skills.length > 3 && (
                            <span className="inline-block px-3 py-1.5 bg-pink-100 text-pink-600 text-sm rounded-full font-medium shadow-sm">
                              +{userData.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Profile Button */}
                  <div className="flex-shrink-0 pt-16">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const currentUserData = getUserData(session?.user?.email);
                          if (currentUserData && currentUserData.username) {
                            router.push(`/profile/${currentUserData.username}`);
                          } else {
                            router.push('/profile-setup');
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300 text-sm font-medium"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => router.push('/profile-setup')}
                        className="px-4 py-2 bg-pink-100 text-pink-700 rounded-xl hover:bg-pink-200 transition-all duration-300 text-sm font-medium"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
          {/* Find Bounties Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-pink-700 mb-3">Find Bounties</h3>
              <p className="text-pink-600 mb-4 text-sm">Discover new projects that match your skills</p>
              <button 
                onClick={() => router.push('/bounties')}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-pink-600 transition-all duration-300"
              >
                Browse Bounties
              </button>
            </div>
          </div>

          {/* My Bounties Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">My Applications</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Active:</span>
                  <span className="font-bold text-pink-700">{userStats.applications.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Completed:</span>
                  <span className="font-bold text-pink-700">{userStats.applications.completed}</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/bounties')}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-pink-500 transition-all duration-300"
              >
                Browse Bounties
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">Leaderboard Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Rank:</span>
                  <span className="font-bold text-pink-700">#{userStats.rank || '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Points:</span>
                  <span className="font-bold text-pink-700">{userStats.points}</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/leaderboard')}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-pink-500 transition-all duration-300"
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

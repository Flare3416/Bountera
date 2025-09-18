'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserRole, getUserData, getUserDisplayNameByEmail, getUserProfileImageByEmail, getUserBackgroundImageByEmail } from '@/utils/userDataMongoDB';
import { getApplicationsForUser } from '@/utils/applicationDataMongoDB';
import { getUserPoints, getUserRank, awardDailyLoginPoints } from '@/utils/pointsSystemMongoDB';
import { getRecentDonations } from '@/utils/donationDataMongoDB';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for user profile data
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    profileImage: '',
    backgroundImage: '',
    userData: null
  });

  // State for user stats
  const [userStats, setUserStats] = useState({
    applications: { active: 0, completed: 0 },
    points: 0,
    rank: null,
    recentDonations: []
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user?.email) {
        try {
          const [displayName, profileImage, backgroundImage, userData] = await Promise.all([
            getUserDisplayNameByEmail(session.user.email),
            getUserProfileImageByEmail(session.user.email),
            getUserBackgroundImageByEmail(session.user.email),
            getUserData(session.user.email)
          ]);

          setUserProfile({
            displayName: displayName || session.user.name || 'User',
            profileImage: profileImage || '/default-avatar.png',
            backgroundImage: backgroundImage || '/default-background.jpg',
            userData
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to session data if database fails
          setUserProfile({
            displayName: session.user.name || 'User',
            profileImage: session.user.image || '/default-avatar.png',
            backgroundImage: '/default-background.jpg',
            userData: null
          });
        }
      }
    };

    loadUserProfile();
  }, [session?.user?.email]);

  // Load user statistics
  useEffect(() => {
    const loadStats = async () => {
      if (session?.user?.email) {
        try {
          // Award daily login points (async now)
          await awardDailyLoginPoints(session.user.email);
          
          // Get user applications (async now)
          const applications = await getApplicationsForUser(session.user.email);
          const activeApplications = applications.filter(app => 
            app.status === 'pending' || app.status === 'accepted'
          ).length;
          const completedApplications = applications.filter(app => 
            app.status === 'completed'
          ).length;

          // Get user points and rank (async now)
          const pointsData = await getUserPoints(session.user.email);
          const points = typeof pointsData === 'number' ? pointsData : pointsData?.points || 0;
          const rank = await getUserRank(session.user.email);
          
          // Get user data to find username for donations (async now)
          const userData = await getUserData(session.user.email);
          const username = userData?.username;
          const recentDonations = username ? await getRecentDonations(username) : [];

          console.log('Dashboard stats update:', { activeApplications, completedApplications, points, rank, username, donationsCount: recentDonations.length });

          setUserStats({
            applications: { 
              active: activeApplications, 
              completed: completedApplications 
            },
            points,
            rank,
            recentDonations: recentDonations || []
          });
        } catch (error) {
          console.error('Error loading dashboard stats:', error);
          // Fallback to default values on error
          setUserStats({
            applications: { active: 0, completed: 0 },
            points: 0,
            rank: null,
            recentDonations: []
          });
        }
      }
    };

    loadStats();

    // Also refresh stats and profile when the page becomes visible (user returns from another tab/page)
    const handleVisibilityChange = useCallback(() => {
      if (!document.hidden) {
        loadStats();
        // Refresh profile data as well
        if (session?.user?.email) {
          const loadUserProfile = async () => {
            try {
              const [displayName, profileImage, backgroundImage, userData] = await Promise.all([
                getUserDisplayNameByEmail(session.user.email),
                getUserProfileImageByEmail(session.user.email),
                getUserBackgroundImageByEmail(session.user.email),
                getUserData(session.user.email)
              ]);

              setUserProfile({
                displayName: displayName || session.user.name || 'User',
                profileImage: profileImage || '/default-avatar.png',
                backgroundImage: backgroundImage || '/default-background.jpg',
                userData
              });
            } catch (error) {
              console.error('Error refreshing user profile:', error);
            }
          };
          loadUserProfile();
        }
      }
    }, [loadStats, session?.user?.email]);

    const handleFocus = useCallback(() => {
      loadStats();
      // Refresh profile data on focus as well
      if (session?.user?.email) {
        const loadUserProfile = async () => {
          try {
            const [displayName, profileImage, backgroundImage, userData] = await Promise.all([
              getUserDisplayNameByEmail(session.user.email),
              getUserProfileImageByEmail(session.user.email),
              getUserBackgroundImageByEmail(session.user.email),
              getUserData(session.user.email)
            ]);

            setUserProfile({
              displayName: displayName || session.user.name || 'User',
              profileImage: profileImage || '/default-avatar.png',
              backgroundImage: backgroundImage || '/default-background.jpg',
              userData
            });
          } catch (error) {
            console.error('Error refreshing user profile:', error);
          }
        };
        loadUserProfile();
      }
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session?.user?.email]);

  // Handle authentication and role redirect in useEffect
  useEffect(() => {
    const checkUserRole = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.email) {
        router.push('/login');
        return;
      }

      // Check user role - if bounty poster, redirect to their dashboard
      const userRole = await getUserRole(session.user.email);
      if (userRole === 'bounty_poster') {
        router.push('/bounty-dashboard');
        return;
      }
    };

    checkUserRole();
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
        {userProfile.userData && (
          <div className="max-w-6xl mx-auto mb-8 mt-12">
            <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-400 overflow-hidden">
                {userProfile.userData.bannerImage || userProfile.backgroundImage ? (
                  <Image
                    src={userProfile.userData.bannerImage || userProfile.backgroundImage}
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
                    priority
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
                      {userProfile.profileImage || userProfile.userData.profileImage ? (
                        <Image
                          src={userProfile.profileImage || userProfile.userData.profileImage}
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
                      {userProfile.userData.name || userProfile.displayName}
                    </h1>
                    
                    {/* User Skills */}
                    {userProfile.userData?.skills && userProfile.userData.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {userProfile.userData.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-sm rounded-full font-medium shadow-sm"
                            >
                              {skill.length > 15 ? skill.substring(0, 15) + '...' : skill}
                            </span>
                          ))}
                          {userProfile.userData.skills.length > 3 && (
                            <span className="inline-block px-3 py-1.5 bg-pink-100 text-pink-600 text-sm rounded-full font-medium shadow-sm">
                              +{userProfile.userData.skills.length - 3} more
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
                        onClick={async () => {
                          try {
                            const currentUserData = await getUserData(session?.user?.email);
                            if (currentUserData && currentUserData.username) {
                              router.push(`/profile/${currentUserData.username}`);
                            } else {
                              router.push('/profile-setup');
                            }
                          } catch (error) {
                            console.error('Error getting user data:', error);
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
                Welcome back, {userProfile.displayName}! 🎉
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

        {/* Recent Donations - Compact & Stylish */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-50 via-white to-pink-50 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-pink-700">Recent Support</h3>
              </div>
              {userStats.recentDonations && userStats.recentDonations.length > 0 && (
                <button 
                  onClick={() => router.push('/donations')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full text-sm font-medium hover:from-pink-600 hover:to-yellow-500 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  View All
                </button>
              )}
            </div>
            
            {userStats.recentDonations && userStats.recentDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userStats.recentDonations.slice(0, 3).map((donation, index) => (
                  <div key={index} className="group relative overflow-hidden bg-white/80 rounded-2xl p-4 border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-bl-3xl opacity-50"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {(donation.donorName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-pink-800 text-sm truncate">{donation.donorName || 'Anonymous'}</p>
                          <p className="text-xs text-pink-500">{new Date(donation.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-pink-700">₹{donation.amount}</p>
                      </div>
                      {donation.message && (
                        <p className="text-xs text-pink-600 italic line-clamp-2">"{donation.message}"</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {userStats.recentDonations.length > 3 && (
                  <div className="group bg-gradient-to-br from-pink-100 to-yellow-100 rounded-2xl p-4 border-2 border-dashed border-pink-200 flex items-center justify-center hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => router.push('/donations')}>
                    <div className="text-center">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</div>
                      <p className="text-sm font-medium text-pink-600">+{userStats.recentDonations.length - 3} more</p>
                      <p className="text-xs text-pink-500">Click to view</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌟</span>
                </div>
                <p className="text-pink-600 font-medium mb-1">Ready to receive support!</p>
                <p className="text-pink-500 text-sm">Share your profile to start getting donations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PurplePetals from '@/components/PurplePetals';
import BountyCard from '@/components/BountyCard';
import { getUserDisplayName, getUserRole, getAllUserData } from '@/utils/userData';
import { getUserBounties, deleteBounty, getBountyExpirationInfo } from '@/utils/bountyData';
import { getUserActivities, logActivity, ACTIVITY_TYPES } from '@/utils/activityData';

const BountyPosterDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userBounties, setUserBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeBounties: 0,
    completedBounties: 0,
    totalApplications: 0,
    totalSpent: 0
  });

  // Load user bounties and stats
  useEffect(() => {
    if (session?.user?.email) {
      const bounties = getUserBounties(session.user.email);
      
      // Filter to show active bounties (excluding expired ones)
      const activeBounties = bounties.filter(bounty => {
        const { isExpired } = getBountyExpirationInfo(bounty.deadline);
        return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
      });
      
      setUserBounties(activeBounties);
      
      // Calculate stats
      const totalBounties = bounties.length;
      const openActiveBounties = bounties.filter(bounty => {
        const { isExpired } = getBountyExpirationInfo(bounty.deadline);
        return bounty.status === 'open' && !isExpired;
      }).length;
      const completedBounties = bounties.filter(bounty => bounty.status === 'completed').length;
      const totalApplications = bounties.reduce((sum, bounty) => sum + (bounty.applicants?.length || 0), 0);
      const totalSpent = bounties
        .filter(bounty => bounty.status === 'completed')
        .reduce((sum, bounty) => {
          const budget = parseFloat(bounty.budget) || 0;
          return sum + budget;
        }, 0);

      setStats({
        totalBounties,
        activeBounties: openActiveBounties,
        completedBounties,
        totalApplications,
        totalSpent
      });
      
      setLoading(false);
    }
  }, [session]);

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
        
        // Refresh the bounties list
        const bounties = getUserBounties(session.user.email);
        const activeBounties = bounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
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
    router.push(`/bounty-application/${bountyId}`);
  };

  if (status === 'loading' || loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden" style={{backgroundColor: '#f3f0ff'}}>
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
                    priority
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Profile Info */}
              <div className="p-6 relative -mt-16">
                <div className="flex items-end space-x-6">
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
                  
                  <div className="flex-1 min-w-0 pt-12 mb-4">
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

        {/* Stats Overview */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-purple-100/50 floating-card-purple">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalBounties}</div>
                <p className="text-purple-500 text-sm">Total Bounties</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-purple-100/50 floating-card-purple">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.activeBounties}</div>
                <p className="text-purple-500 text-sm">Active</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-purple-100/50 floating-card-purple">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.completedBounties}</div>
                <p className="text-purple-500 text-sm">Completed</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-purple-100/50 floating-card-purple">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalApplications}</div>
                <p className="text-purple-500 text-sm">Applications</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-purple-100/50 floating-card-purple">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${(Number(stats.totalSpent) || 0).toFixed(2)}</div>
                <p className="text-purple-500 text-sm">Total Spent</p>
              </div>
            </div>
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
                <h3 className="text-xl font-bold text-purple-700 mb-3">Post New Bounty</h3>
                <p className="text-purple-600 mb-4">Create a new project </p>
                <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 group-hover:shadow-lg">
                  Create Bounty
                </div>
              </div>
            </div>

            {/* Manage Bounties */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => router.push('/my-bounties')}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">Manage Bounties</h3>
                <p className="text-purple-600 mb-4">View and manage your ongoing projects</p>
                <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 group-hover:shadow-lg">
                  View Bounties
                </div>
              </div>
            </div>

            {/* View Applications */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => router.push('/applicants')}>
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👥</div>
                <h3 className="text-xl font-bold text-purple-700 mb-3">View Applications</h3>
                <p className="text-purple-600 mb-4">Review applications from creators</p>
                <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 group-hover:shadow-lg">
                  Review Applications
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bounties */}
        <div className="max-w-6xl mx-auto">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-700">Recent Bounties</h2>
              <Link href="/create-bounty">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                  + Create New Bounty
                </button>
              </Link>
            </div>

            {userBounties.length === 0 ? (
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
                {userBounties.slice(0, 6).map((bounty) => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    isOwner={true}
                    userRole="bounty_poster"
                    onEdit={handleEditBounty}
                    onDelete={handleDeleteBounty}
                    onApply={handleApplyToBounty}
                  />
                ))}
              </div>
            )}
            
            {userBounties.length > 6 && (
              <div className="text-center mt-6">
                <Link href="/my-bounties">
                  <button className="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300">
                    View All Bounties
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyPosterDashboard;
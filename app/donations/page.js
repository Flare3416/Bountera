'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserData } from '@/utils/userDataMongoDB';
import { getDonationsForCreator, getDonationStats, formatCurrency, getTopDonors } from '@/utils/donationDataMongoDB';
import DashboardNavbar from '@/components/DashboardNavbar';

const DonationsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // Get user data from MongoDB using session email
        const userData = await getUserData(session.user.email);
        if (!userData || !userData.username) {
          router.push('/profile-setup');
          return;
        }

        setUser(userData);
        
        // Load donations data using username (keep existing functions for now)
        const userDonations = getDonationsForCreator(userData.username);
        const donationStats = getDonationStats(userData.username);
        const donors = getTopDonors(userData.username, 5);
        
        setDonations(userDonations);
        setStats(donationStats);
        setTopDonors(donors);
        setLoading(false);
      } catch (error) {
        console.error('Error loading donation data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-600">Loading your donations...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Dashboard Navbar */}
      <DashboardNavbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-pink-800 mb-2">My Donations</h1>
              <p className="text-pink-600">Track and manage donations received</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="text-lg font-bold text-pink-700">Total Amount</h3>
                <p className="text-2xl font-bold text-pink-800">{formatCurrency(stats.totalAmount || 0)}</p>
              </div>
            </div>
            
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <div className="text-center">
                <div className="text-3xl mb-2">🎁</div>
                <h3 className="text-lg font-bold text-pink-700">Total Donations</h3>
                <p className="text-2xl font-bold text-pink-800">{stats.totalDonations || 0}</p>
              </div>
            </div>
            
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <h3 className="text-lg font-bold text-pink-700">This Month</h3>
                <p className="text-2xl font-bold text-pink-800">{formatCurrency(stats.recentAmount || 0)}</p>
              </div>
            </div>
            
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="text-lg font-bold text-pink-700">Average</h3>
                <p className="text-2xl font-bold text-pink-800">{formatCurrency(stats.averageDonation || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* All Donations */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-gradient-to-br from-yellow-50 via-white to-pink-50 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <h2 className="text-2xl font-bold text-pink-800">All Donations</h2>
                </div>
                <span className="text-sm text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                  {donations.length} total
                </span>
              </div>
              
              {donations.length > 0 ? (
                <div 
                  className="max-h-96 overflow-y-auto overflow-x-hidden scrollbar-pink"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#ec4899 #fce7f3'
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                    {donations
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((donation) => (
                      <div key={donation.id} className="group relative overflow-hidden bg-white/80 rounded-2xl p-4 border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-105 min-w-0">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-bl-3xl opacity-50"></div>
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {(donation.donorName || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-pink-800 text-sm truncate">{donation.donorName || 'Anonymous'}</p>
                              <p className="text-xs text-pink-500">{new Date(donation.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mb-2">
                            <p className="text-2xl font-bold text-pink-700">{formatCurrency(donation.amount)}</p>
                          </div>
                          {donation.message && (
                            <p className="text-xs text-pink-600 italic line-clamp-2 break-words">&quot;{donation.message}&quot;</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-xl font-bold text-pink-700 mb-2">No donations yet</h3>
                  <p className="text-pink-600">Share your profile to start receiving donations!</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Donors */}
          <div>
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <h2 className="text-xl font-bold text-pink-800 mb-6">Top Donors</h2>
              
              {topDonors.length > 0 ? (
                <div className="space-y-3">
                  {topDonors.map((donor, index) => (
                    <div key={donor.name} className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-pink-800 text-sm">{donor.name}</p>
                        <p className="text-xs text-pink-600">{donor.donationCount} donations</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700 text-sm">{formatCurrency(donor.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-pink-600 text-sm">No donors yet</p>
                </div>
              )}
            </div>

            {/* Share Profile */}
            <div className="mt-6 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100">
              <h3 className="text-lg font-bold text-pink-800 mb-4">Share Your Profile</h3>
              <p className="text-pink-600 text-sm mb-4">Let others support your work by sharing your profile</p>
              <button 
                onClick={() => {
                  const profileUrl = `${window.location.origin}/profile/${user.username}`;
                  navigator.clipboard.writeText(profileUrl);
                  alert('Profile link copied to clipboard!');
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-pink-500 transition-all duration-300"
              >
                Copy Profile Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
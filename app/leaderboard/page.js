'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BountyHunterNavbar from '@/components/BountyHunterNavbar';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import Navbar from '@/components/Navbar';
import SakuraPetals from '@/components/SakuraPetals';
import PurplePetals from '@/components/PurplePetals';
import { getUserRole } from '@/utils/userData';
import { getLeaderboardData } from '@/utils/pointsSystem';

const Leaderboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);

  // Get user role for theme consistency, default to 'creator' theme for non-logged-in users
  const userRole = getUserRole(session) || 'creator';

  useEffect(() => {
    // Load creators regardless of authentication status
    loadCreators();
  }, []);

  const loadCreators = () => {
    try {
      const allCreators = getLeaderboardData();
      setCreators(allCreators);
      setFilteredCreators(allCreators);
    } catch (error) {
      console.error('Error loading creators:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter creators based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCreators(creators);
    } else {
      const filtered = creators.filter(creator =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCreators(filtered);
    }
    setVisibleCount(10); // Reset visible count when searching
  }, [searchTerm, creators]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleProfileClick = (username) => {
    // Allow both logged-in and non-logged-in users to view profiles
    router.push(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${
        userRole === 'bounty_poster' 
          ? 'from-purple-50 via-white to-purple-100' 
          : 'from-pink-50 via-white to-pink-100'
      } flex items-center justify-center`}>
        {userRole === 'bounty_poster' ? <PurplePetals /> : <SakuraPetals />}
        <div className="text-center relative z-10">
          <div className={`p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border ${
            userRole === 'bounty_poster' ? 'border-purple-100/50' : 'border-pink-100/50'
          } floating-card`}>
            <div className="text-4xl mb-4">🏆</div>
            <h1 className={`text-2xl font-bold ${
              userRole === 'bounty_poster' ? 'text-purple-700' : 'text-pink-700'
            } mb-2`}>Loading Leaderboard...</h1>
            <p className={userRole === 'bounty_poster' ? 'text-purple-600' : 'text-pink-600'}>
              Please wait while we load the creators
            </p>
          </div>
        </div>
      </div>
    );
  }

  const visibleCreators = filteredCreators.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCreators.length;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      userRole === 'bounty_poster' 
        ? 'from-purple-50 via-white to-purple-100' 
        : 'from-pink-50 via-white to-pink-100'
    } relative overflow-hidden`}>
      {/* Navbar - Show role-specific navbar for logged-in users, regular navbar for guests */}
      {session ? (
        userRole === 'bounty_poster' ? <BountyPosterNavbar /> : <BountyHunterNavbar />
      ) : (
        <Navbar />
      )}

      {/* Petals Effect */}
      {userRole === 'bounty_poster' ? <PurplePetals /> : <SakuraPetals />}

      {/* Main Content */}
      <div className="relative z-10 mt-10 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className={`text-4xl font-bold ${
            userRole === 'bounty_poster' ? 'text-purple-700' : 'text-pink-700'
          } mb-4`}>🏆 Creator Leaderboard</h1>
          <p className={`${
            userRole === 'bounty_poster' ? 'text-purple-600' : 'text-pink-600'
          } text-lg`}>Discover and connect with top creators in our community</p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              onClick={() => {
                if (session) {
                  router.push(userRole === 'bounty_poster' ? '/bounty-dashboard' : '/dashboard');
                } else {
                  router.push('/');
                }
              }}
              className={`px-6 py-3 bg-white/80 backdrop-blur-md border-2 ${
                userRole === 'bounty_poster' 
                  ? 'border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50' 
                  : 'border-pink-200 text-pink-700 hover:border-pink-400 hover:bg-pink-50'
              } rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105`}
            >
              ← {session ? 'Back to Dashboard' : 'Back to Home'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search creators by name or username..."
              className={`w-full px-6 py-4 rounded-2xl border-2 ${
                userRole === 'bounty_poster' 
                  ? 'border-purple-200 focus:border-purple-400 text-purple-800 placeholder-purple-400' 
                  : 'border-pink-200 focus:border-pink-400 text-pink-800 placeholder-pink-400'
              } focus:outline-none bg-white/80 backdrop-blur-md text-lg`}
            />
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
              userRole === 'bounty_poster' ? 'text-purple-400' : 'text-pink-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
      
          
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          {visibleCreators.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-pink-700 mb-2">
                {searchTerm ? 'No creators found' : 'No creators yet'}
              </h3>
              <p className="text-pink-600 mb-6">
                {searchTerm 
                  ? `No creators match "${searchTerm}". Try a different search term.`
                  : 'Be the first creator to join the leaderboard!'
                }
              </p>
              {!searchTerm && userRole !== 'bounty_poster' && (
                <button
                  onClick={() => router.push('/profile-setup')}
                  className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Complete Your Profile
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {visibleCreators.map((creator, index) => (
                <div
                  key={creator.email}
                  onClick={() => handleProfileClick(creator.username)}
                  className="group cursor-pointer"
                >
                  <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            creator.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                            creator.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                            creator.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                            'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700'
                          }`}>
                            {creator.rank <= 3 ? (
                              creator.rank === 1 ? '🥇' : creator.rank === 2 ? '🥈' : '🥉'
                            ) : (
                              creator.rank
                            )}
                          </div>
                        </div>

                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full border-3 border-pink-300 overflow-hidden bg-white">
                            {creator.profileImage ? (
                              <Image
                                src={creator.profileImage}
                                alt={creator.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image
                                src="/defaultpfp.jpg"
                                alt="Default Profile"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>

                        {/* Creator Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-pink-700 truncate group-hover:text-pink-800 transition-colors">
                            {creator.name}
                          </h3>
                          <p className="text-pink-500 text-sm">@{creator.username}</p>
                          {creator.skills && creator.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {creator.skills.slice(0, 3).map((skill, skillIndex) => (
                                <span
                                  key={`${creator.email}-skill-${skillIndex}`}
                                  className="inline-block px-2 py-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-xs rounded-full font-medium"
                                >
                                  {skill.length > 12 ? skill.substring(0, 12) + '...' : skill}
                                </span>
                              ))}
                              {creator.skills.length > 3 && (
                                <span className="inline-block px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full font-medium">
                                  +{creator.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-pink-700">{creator.points}</div>
                        <div className="text-pink-500 text-sm">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                Load More Creators ({filteredCreators.length - visibleCount} remaining)
              </button>
            </div>
          )}

          {/* SEO Information */}
          <div className="text-center mt-8 text-pink-500 text-sm">
            Showing {Math.min(visibleCount, filteredCreators.length)} of {filteredCreators.length} creators
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import PurplePetals from '@/components/PurplePetals';
import BountyCard from '@/components/BountyCard';
import { getUserRole } from '@/utils/userData';
import { 
  getAllBounties, 
  filterBountiesByCategory, 
  filterBountiesByDifficulty, 
  searchBounties, 
  BOUNTY_CATEGORIES, 
  DIFFICULTY_LEVELS,
  deleteBounty,
  updateExpiredBounties,
  isBountyExpired,
  getBountyExpirationInfo,
  normalizeBountyData,
  getUserBountiesByRole,
  isBountyOwner
} from '@/utils/bountyData';
import { logActivity, ACTIVITY_TYPES } from '@/utils/activityData';

const MyBounties = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Immediate redirect check for bounty hunters
  const currentUserRole = session ? getUserRole(session) : null;
  if (session && currentUserRole === 'bounty_hunter') {
    router.push('/bounties');
    return null;
  }
  
  const [myBounties, setMyBounties] = useState([]);
  const [filteredBounties, setFilteredBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: '',
    status: 'all'
  });

  // Check authentication and user role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const role = getUserRole(session);
    setUserRole(role);
    
    if (role === 'bounty_hunter') {
      // Redirect bounty hunters to general bounties page
      router.push('/bounties');
      return;
    }
  }, [session, status, router]);

  // Load user's bounties
  useEffect(() => {
    if (!session) return;

    // First, update any expired bounties and clean up data structure
    let allBounties = updateExpiredBounties();
    
    // Normalize bounties to ensure consistent field structure
    allBounties = allBounties.map(normalizeBountyData);
    
    // Force update expired bounties again after normalization
    let expiredUpdates = 0;
    allBounties = allBounties.map(bounty => {
      const isExpired = isBountyExpired(bounty.deadline);
      if (isExpired && bounty.status !== 'expired' && bounty.status !== 'completed') {
        expiredUpdates++;
        return { ...bounty, status: 'expired' };
      }
      return bounty;
    });
    
    // Save updated bounties back to localStorage
    localStorage.setItem('bountera_all_bounties', JSON.stringify(allBounties));
    
    // Save normalized bounties back to localStorage
    localStorage.setItem('bountera_all_bounties', JSON.stringify(allBounties));
    
    // Rebuild user-specific bounty lists
    const userEmails = [...new Set(allBounties.map(b => b.creator))];
    userEmails.forEach(email => {
      const userSpecificBounties = allBounties.filter(b => b.creator === email);
      localStorage.setItem(`bountera_bounties_${email}`, JSON.stringify(userSpecificBounties));
    });
    
    // Get user bounties based on role using centralized logic
    const userBounties = getUserBountiesByRole(allBounties, session.user.email, userRole);

    // Filter to show open, completed, and in-progress bounties by default (exclude expired)
    const activeUserBounties = userBounties.filter(bounty => {
      const { isExpired } = getBountyExpirationInfo(bounty.deadline);
      
      // Show all status types except expired bounties
      return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
    });
    
    setMyBounties(userBounties); // Keep all bounties for filtering
    setFilteredBounties(activeUserBounties); // Show active bounties by default
    setLoading(false);
  }, [session, userRole]);

  // Refresh bounties when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email && userRole) {
        
        // Refresh bounties using centralized utilities
        let allBounties = updateExpiredBounties();
        allBounties = allBounties.map(normalizeBountyData);
        
        const userBounties = getUserBountiesByRole(allBounties, userRole, session.user.email);
        setMyBounties(userBounties);
        
        // Filter to show open, completed, and in-progress bounties by default (exclude expired)
        const activeUserBounties = userBounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          
          // Show all status types except expired bounties
          return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
        });
        
        setFilteredBounties(activeUserBounties);
      }
    };

    const handleFocus = () => {
      if (session?.user?.email && userRole) {        
        // Refresh bounties using centralized utilities
        let allBounties = updateExpiredBounties();
        allBounties = allBounties.map(normalizeBountyData);
        
        const userBounties = getUserBountiesByRole(allBounties, userRole, session.user.email);
        setMyBounties(userBounties);
        
        // Filter to show open, completed, and in-progress bounties by default (exclude expired)
        const activeUserBounties = userBounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          
          // Show all status types except expired bounties
          return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
        });
        
        setFilteredBounties(activeUserBounties);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session?.user?.email, userRole]);

  // Apply filters
  useEffect(() => {
    let filtered = myBounties;
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filterBountiesByCategory(filtered, filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filterBountiesByDifficulty(filtered, filters.difficulty);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      if (filters.status === 'expired') {
        // Use the same real-time expiration check as the stats and BountyCard
        filtered = filtered.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          return isExpired; // Expired by deadline
        });
      } else if (filters.status === 'open') {
        // Show only bounties that are open AND not expired by deadline
        filtered = filtered.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          return bounty.status === 'open' && !isExpired; // Open and not expired
        });
      } else {
        // For other statuses (in_progress, completed), show only those with exact status
        // Don't exclude by expiration for completed bounties
        if (filters.status === 'completed') {
          filtered = filtered.filter(bounty => bounty.status === filters.status);
        } else {
          // For in_progress, exclude expired ones
          filtered = filtered.filter(bounty => {
            const { isExpired } = getBountyExpirationInfo(bounty.deadline);
            return bounty.status === filters.status && !isExpired;
          });
        }
      }
    } else {
      // For "All Status" - exclude expired bounties by default (same logic as initial load)
      filtered = filtered.filter(bounty => {
        const { isExpired } = getBountyExpirationInfo(bounty.deadline);
        
        // Show all status types except expired bounties
        return !isExpired || ['completed', 'in-progress', 'cancelled'].includes(bounty.status);
      });
    }

    // Apply search filter
    if (filters.search) {
      filtered = searchBounties(filtered, filters.search);
    }

    setFilteredBounties(filtered);
  }, [myBounties, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleEditBounty = (bountyId) => {
    router.push(`/create-bounty?edit=${bountyId}`);
  };

  const handleDeleteBounty = (bountyId) => {
    if (window.confirm('Are you sure you want to delete this bounty?')) {
      // Get bounty details for activity logging before deletion
      const bountyToDelete = myBounties.find(b => b.id === bountyId);
      
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
        const allBounties = getAllBounties();
        const userBounties = getUserBountiesByRole(allBounties, userRole, session.user.email);
        setMyBounties(userBounties);
        setFilteredBounties(userBounties);
        alert('Bounty deleted successfully!');
      } else {
        alert('Failed to delete bounty.');
      }
    }
  };

  const handleApplyToBounty = (bountyId) => {
    router.push(`/bounty-application/${bountyId}`);
  };

  // Early return for loading states and unauthorized users
  if (status === 'loading' || loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-xl text-purple-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Block access if not bounty poster
  if (userRole && userRole !== 'bounty_poster') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
            <div className="text-4xl mb-4">🚫</div>
            <div className="text-xl text-purple-600">Access Denied</div>
            <div className="text-purple-500 mt-2">This page is only for bounty posters</div>
            <button 
              onClick={() => router.push('/bounties')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Bounties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content for bounty hunters (they should be redirected)
  if (userRole === 'bounty_hunter' || currentUserRole === 'bounty_hunter') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
            <div className="text-4xl mb-4">�</div>
            <div className="text-xl text-purple-600">Access Denied</div>
            <div className="text-purple-500 mt-2">This page is only for bounty posters</div>
          </div>
        </div>
      </div>
    );
  }

  // Only allow bounty posters to access this page
  if (session && userRole && userRole !== 'bounty_poster') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
            <div className="text-4xl mb-4">🚫</div>
            <div className="text-xl text-purple-600">Access Denied</div>
            <div className="text-purple-500 mt-2">This page is only for bounty posters</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getPageTitle = () => {
    if (userRole === 'bounty_poster') {
      return 'My Created Bounties';
    } else if (userRole === 'bounty_hunter') {
      return 'My Applied Bounties';
    }
    return 'My Bounties';
  };

  const getEmptyMessage = () => {
    if (userRole === 'bounty_poster') {
      return "You haven't created any bounties yet.";
    } else if (userRole === 'bounty_hunter') {
      return "You haven't applied to any bounties yet.";
    }
    return "No bounties found.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <PurplePetals />
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {userRole === 'bounty_poster' 
              ? 'Manage and track all the bounties you\'ve created'
              : 'View and manage all the bounties you\'ve applied to'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search bounties..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="all">All Categories</option>
                {BOUNTY_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="all">All Levels</option>
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{myBounties.length}</div>
            <div className="text-gray-600">
              {userRole === 'bounty_poster' ? 'Total Created' : 'Total Applied'}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {myBounties.filter(b => {
                const { isExpired } = getBountyExpirationInfo(b.deadline);
                return b.status === 'open' && !isExpired;
              }).length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {myBounties.filter(b => {
                const { isExpired } = getBountyExpirationInfo(b.deadline);
                return isExpired;
              }).length}
            </div>
            <div className="text-gray-600">Expired</div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBounties.length} of {myBounties.length} bounties
          </p>
        </div>

        {/* Bounties Grid */}
        {filteredBounties.length > 0 && session?.user?.email ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBounties.map(bounty => {
              // Create safe function wrappers
              const safeOnEdit = typeof handleEditBounty === 'function' ? handleEditBounty : () => console.error('handleEditBounty not available');
              const safeOnDelete = typeof handleDeleteBounty === 'function' ? handleDeleteBounty : () => console.error('handleDeleteBounty not available');
              const safeOnApply = typeof handleApplyToBounty === 'function' ? (id) => handleApplyToBounty(id) : () => console.error('handleApplyToBounty not available');
              
              return (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  isOwner={userRole === 'bounty_poster' && session?.user?.email && isBountyOwner(bounty, session.user.email)}
                  userRole={userRole}
                  onEdit={safeOnEdit}
                  onDelete={safeOnDelete}
                  onApply={() => safeOnApply(bounty.id)}
                />
              );
            })}
          </div>
        ) : filteredBounties.length > 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h3>
            <p className="text-gray-600">Setting up your dashboard...</p>
          </div>
        ) : (
          <div className="text-center py-16">
            {myBounties.length === 0 ? (
              // Truly no bounties created
              <>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {getEmptyMessage()}
                </h3>
                <p className="text-gray-600 mb-8">
                  {userRole === 'bounty_poster' 
                    ? 'Start by creating your first bounty to connect with talented hunters.'
                    : 'Browse available bounties and start applying to earn rewards.'
                  }
                </p>
                <button
                  onClick={() => router.push(userRole === 'bounty_poster' ? '/create-bounty' : '/bounties')}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {userRole === 'bounty_poster' ? 'Create First Bounty' : 'Browse Bounties'}
                </button>
              </>
            ) : (
              // Bounties exist but filtered out
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No bounties match your current filters
                </h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      category: 'all',
                      difficulty: 'all',
                      status: 'all',
                      search: ''
                    });
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBounties;
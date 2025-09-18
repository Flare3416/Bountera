'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import PurplePetals from '@/components/PurplePetals';
import SakuraPetals from '@/components/SakuraPetals';
import BountyCard from '@/components/BountyCard';
import BountyModal from '@/components/BountyModal';
import { getUserRole } from '@/utils/authMongoDB';
import { 
  filterBountiesByCategory, 
  filterBountiesByDifficulty, 
  searchBounties, 
  BOUNTY_CATEGORIES, 
  DIFFICULTY_LEVELS,
  isBountyExpired,
  getBountyExpirationInfo,
  normalizeBountyData,
  getUserBountiesByRole,
  isBountyOwner
} from '@/utils/bountyDataMongoDB';

const MyBounties = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Immediate redirect check for creators
  const currentUserRole = session?.user?.role || null;
  if (session && currentUserRole === 'creator') {
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
    status: 'open'
  });
  
  // Modal state
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Theme colors based on user role - using useMemo to avoid accessing userRole before it's set
  const themeColors = useMemo(() => {
    const isPoster = userRole === 'bounty_poster';
    return isPoster ? {
      gradient: 'from-purple-600 to-purple-400',
      text: 'text-purple-600',
      textLight: 'text-purple-500',
      bg: 'bg-purple-50',
      bgGradient: 'from-purple-50 via-white to-purple-100',
      border: 'border-purple-200',
      ring: 'ring-purple-500',
      cardBg: 'bg-white/80',
      filterText: 'text-purple-700',
      button: 'from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
    } : {
      gradient: 'from-pink-600 to-pink-400',
      text: 'text-pink-600',
      textLight: 'text-pink-500',
      bg: 'bg-pink-50',
      bgGradient: 'from-pink-50 via-white to-pink-100',
      border: 'border-pink-200',
      ring: 'ring-pink-500',
      cardBg: 'bg-white/80',
      filterText: 'text-pink-700',
      button: 'from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600'
    };
  }, [userRole]);

  // Check authentication and user role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const role = session?.user?.role || null;
    setUserRole(role);
    
    if (role === 'creator') {
      // Redirect bounty hunters to general bounties page
      router.push('/bounties');
      return;
    }
  }, [session, status, router]);

  // Load user's bounties
  useEffect(() => {
    if (!session) return;

    const loadBounties = async () => {
      try {
        // Get all bounties from API
        const response = await fetch('/api/bounties');
        const apiResponse = await response.json();
        
        // Extract array from API response structure {success: true, data: Array, pagination: {...}}
        let allBounties = apiResponse.data || [];
        
        // Ensure we have an array - fix for "allBounties.map is not a function" error
        if (!Array.isArray(allBounties)) {
          console.error('Expected array but got:', typeof allBounties, allBounties);
          allBounties = [];
        }
        
        // Normalize bounties to ensure consistent field structure
        allBounties = allBounties.map(normalizeBountyData);
        
        // Get user bounties based on role using centralized logic
        const userBounties = getUserBountiesByRole(allBounties, session.user.email, userRole);

        // Filter to show only open bounties by default
        const openUserBounties = userBounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          return bounty.status === 'open' && !isExpired;
        });
        
        setMyBounties(userBounties); // Keep all bounties for filtering
        setFilteredBounties(openUserBounties); // Show only open bounties by default
        setLoading(false);
      } catch (error) {
        console.error('Error loading bounties:', error);
        setLoading(false);
      }
    };

    loadBounties();
  }, [session, userRole]);

  // Refresh bounties when returning to the page
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && session?.user?.email && userRole) {
        console.log('Visibility change - refreshing data');
        console.log('Session email:', session.user.email);
        console.log('User role:', userRole);
        
        try {
          // Refresh bounties from API
          const response = await fetch('/api/bounties');
          const apiResponse = await response.json();
          let allBounties = apiResponse.data || [];
          allBounties = allBounties.map(normalizeBountyData);
          
          const userBounties = getUserBountiesByRole(allBounties, session.user.email, userRole);
          console.log('Visibility change - User bounties found:', userBounties.length);
          
          setMyBounties(userBounties);
          
          // Filter to show only open bounties by default
          const openUserBounties = userBounties.filter(bounty => {
            const { isExpired } = getBountyExpirationInfo(bounty.deadline);
            return bounty.status === 'open' && !isExpired;
          });
          
          console.log('Visibility change - Open user bounties:', openUserBounties.length);
          setFilteredBounties(openUserBounties);
        } catch (error) {
          console.error('Error refreshing bounties on visibility change:', error);
        }
      }
    };

    const handleFocus = async () => {
      if (session?.user?.email && userRole) {
        console.log('Focus event - refreshing data');
        console.log('Session email:', session.user.email);
        console.log('User role:', userRole);
        
        try {
          // Refresh bounties from API
          const response = await fetch('/api/bounties');
          const apiResponse = await response.json();
          let allBounties = apiResponse.data || [];
          allBounties = allBounties.map(normalizeBountyData);
          
          const userBounties = getUserBountiesByRole(allBounties, session.user.email, userRole);
          console.log('Focus event - User bounties found:', userBounties.length);
          
          setMyBounties(userBounties);
          
          // Filter to show only open bounties by default
          const openUserBounties = userBounties.filter(bounty => {
            const { isExpired } = getBountyExpirationInfo(bounty.deadline);
            return bounty.status === 'open' && !isExpired;
          });
          
          console.log('Focus event - Open user bounties:', openUserBounties.length);
          setFilteredBounties(openUserBounties);
        } catch (error) {
          console.error('Error refreshing bounties on focus:', error);
        }
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
      // For other statuses (in_progress, completed, cancelled), show only those with exact status
      // Don't exclude by expiration for completed bounties
      if (filters.status === 'completed') {
        filtered = filtered.filter(bounty => bounty.status === filters.status);
      } else {
        // For in_progress and cancelled, exclude expired ones
        filtered = filtered.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          return bounty.status === filters.status && !isExpired;
        });
      }
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

  const handleDeleteBounty = async (bountyId) => {
    if (window.confirm('Are you sure you want to delete this bounty?')) {
      try {
        // Get bounty details for activity logging before deletion
        const bountyToDelete = myBounties.find(b => b.id === bountyId);
        
        // Delete via API
        const response = await fetch(`/api/bounties/${bountyId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Log the activity
          if (bountyToDelete) {
            await fetch('/api/activities', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: session.user.email,
                type: 'bounty_deleted',
                description: `Deleted bounty: ${bountyToDelete.title}`,
                metadata: { 
                  bountyTitle: bountyToDelete.title,
                  bountyId: bountyId
                }
              })
            });
          }
        
          // Refresh the bounties list
          const bountyResponse = await fetch('/api/bounties');
          const apiResponse = await bountyResponse.json();
          const allBounties = apiResponse.data || [];
          const normalizedBounties = allBounties.map(normalizeBountyData);
          const userBounties = getUserBountiesByRole(normalizedBounties, session.user.email, userRole);
        
          // Apply the same filtering as initial load
          const openUserBounties = userBounties.filter(bounty => {
            const { isExpired } = getBountyExpirationInfo(bounty.deadline);
            return bounty.status === 'open' && !isExpired;
          });
        
          setMyBounties(userBounties);
          setFilteredBounties(openUserBounties);
          alert('Bounty deleted successfully!');
        } else {
          alert('Failed to delete bounty.');
        }
      } catch (error) {
        console.error('Error deleting bounty:', error);
        alert('Failed to delete bounty.');
      }
    }
  };

  const handleUpdateBountyStatus = async (bountyId, newStatus) => {
    const statusNames = {
      'open': 'Open',
      'in-progress': 'In Progress', 
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    if (window.confirm(`Are you sure you want to change this bounty status to "${statusNames[newStatus]}"?`)) {
      try {
        // Update the bounty status via API
        const response = await fetch(`/api/bounties/${bountyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update bounty status');
        }
        
        const updatedBounty = await response.json();
        
        // Award completion points if bounty is marked as completed
        if (newStatus === 'completed') {
          // Find accepted applications for this bounty to award points to creators
          const applicationsResponse = await fetch(`/api/applications?bountyId=${bountyId}`);
          const applications = await applicationsResponse.json();
          const acceptedApplications = applications.filter(app => app.status === 'accepted');
          
          // Award points to accepted creators
          for (const application of acceptedApplications) {
            if (application.email) {
              await fetch('/api/points/award', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: application.email,
                  points: updatedBounty.points || 0,
                  type: 'bounty_completion',
                  description: `Completed bounty: ${updatedBounty.title}`,
                  bountyId: bountyId
                })
              });
            }
          }
        }
        
        // Log the activity
        await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            type: 'bounty_updated',
            description: `Updated bounty status to ${newStatus}`,
            metadata: { 
              bountyTitle: updatedBounty.title,
              bountyId: bountyId,
              newStatus: newStatus
            }
          })
        });
        
        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('bountyStatusUpdated', { 
          detail: { bountyId, action: newStatus } 
        }));
        
        // Refresh the data
        const bountyResponse = await fetch('/api/bounties');
        const apiResponse = await bountyResponse.json();
        const allBounties = apiResponse.data || [];
        const normalizedBounties = allBounties.map(normalizeBountyData);
        const userBounties = getUserBountiesByRole(normalizedBounties, session.user.email, userRole);
        
        // Apply the same filtering as initial load
        const openUserBounties = userBounties.filter(bounty => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          return bounty.status === 'open' && !isExpired;
        });
        
        console.log('Status update - Open user bounties:', openUserBounties.length);
        
        // Update state before showing alert
        setMyBounties(userBounties);
        setFilteredBounties(openUserBounties);
        
        // Show success message
        setTimeout(() => {
          alert(`Bounty status updated to "${statusNames[newStatus]}" successfully!`);
        }, 100);
        
      } catch (error) {
        console.error('Error updating bounty status:', error);
        alert('Failed to update bounty status.');
      }
    }
  };

  const handleApplyToBounty = (bountyId) => {
    router.push(`/bounty-application/${bountyId}`);
  };

  const handleViewDetails = (bounty) => {
    setSelectedBounty(bounty);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBounty(null);
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
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`p-6 rounded-3xl ${themeColors.cardBg} backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card`}>
            <div className="text-4xl mb-4">🚫</div>
            <div className={`text-xl ${themeColors.text}`}>Access Denied</div>
            <div className={`${themeColors.textLight} mt-2`}>This page is only for bounty posters</div>
            <button 
              onClick={() => router.push('/bounties')}
              className={`mt-4 px-4 py-2 bg-gradient-to-r ${themeColors.button} text-white rounded-lg transition-all duration-300`}
            >
              Go to Bounties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content for creators (they should be redirected)
  if (userRole === 'creator' || currentUserRole === 'creator') {
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
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`p-6 rounded-3xl ${themeColors.cardBg} backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card`}>
            <div className="text-4xl mb-4">🚫</div>
            <div className={`text-xl ${themeColors.text}`}>Access Denied</div>
            <div className={`${themeColors.textLight} mt-2`}>This page is only for bounty posters</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content for creators (they should be redirected)
  if (userRole === 'creator' || currentUserRole === 'creator') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`p-6 rounded-3xl ${themeColors.cardBg} backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card`}>
            <div className="text-4xl mb-4">🚫</div>
            <div className={`text-xl ${themeColors.text}`}>Access Denied</div>
            <div className={`${themeColors.textLight} mt-2`}>This page is only for bounty posters</div>
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
    } else if (userRole === 'creator') {
      return 'My Applied Bounties';
    }
    return 'My Bounties';
  };

  const getEmptyMessage = () => {
    if (userRole === 'bounty_poster') {
      return "You haven't created any bounties yet.";
    } else if (userRole === 'creator') {
      return "You haven't applied to any bounties yet.";
    }
    return "No bounties found.";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient}`}>
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
                {BOUNTY_CATEGORIES.map((category, index) => (
                  <option key={category} value={category}>
                    {category}
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
                {DIFFICULTY_LEVELS.map((level, index) => (
                  <option key={level} value={level}>
                    {level}
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
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                  onUpdateStatus={handleUpdateBountyStatus}
                  onApply={() => safeOnApply(bounty.id)}
                  onViewDetails={handleViewDetails}
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
                      status: 'open',
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

      {/* Bounty Modal */}
      {isModalOpen && selectedBounty && (
        <BountyModal
          bounty={selectedBounty}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userRole={userRole}
          onApply={undefined} // Bounty posters can't apply to their own bounties
        />
      )}
    </div>
  );
};

export default MyBounties;
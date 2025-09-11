'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  saveBounty,
  updateExpiredBounties,
  getBountyExpirationInfo
} from '@/utils/bountyData';

const Bounties = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allBounties, setAllBounties] = useState([]);
  const [filteredBounties, setFilteredBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: '',
    status: 'all'  // Add status filter
  });

  // Theme colors based on user role - using useMemo to avoid accessing userRole before it's set
  const themeColors = useMemo(() => {
    const isPoster = userRole === 'bounty_poster';
    return isPoster ? {
      gradient: 'from-purple-600 to-purple-400',
      text: 'text-purple-600',
      textLight: 'text-purple-500',
      bg: 'bg-purple-50',
      bgGradient: 'from-purple-50 via-white to-purple-100',
      border: 'border-purple-100',
      ring: 'ring-purple-500',
      cardBg: 'bg-white/80',
      filterText: 'text-purple-700'
    } : {
      gradient: 'from-pink-600 to-pink-400',
      text: 'text-pink-600',
      textLight: 'text-pink-500',
      bg: 'bg-pink-50',
      bgGradient: 'from-pink-50 via-white to-pink-100',
      border: 'border-pink-100',
      ring: 'ring-pink-500',
      cardBg: 'bg-white/80',
      filterText: 'text-pink-700'
    };
  }, [userRole]);

  // Check authentication and user role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const role = getUserRole(session);
    setUserRole(role);
    
    // Load bounties for both bounty hunters and bounty posters
    // Filter out expired bounties automatically for the main bounties view
    const allBountiesData = updateExpiredBounties();
    
    const activeBounties = allBountiesData.filter(bounty => {
      const { isExpired } = getBountyExpirationInfo(bounty.deadline);
      return !isExpired; // Only show non-expired bounties
    });
    
    setAllBounties(activeBounties);
    setFilteredBounties(activeBounties);
    
    setLoading(false);
  }, [session, status, router]);

  // Apply filters
  useEffect(() => {
    let filtered = allBounties;

    // Apply category filter
    filtered = filterBountiesByCategory(filtered, filters.category);

    // Apply difficulty filter
    filtered = filterBountiesByDifficulty(filtered, filters.difficulty);

    // Apply status filter (only show open/active bounties, expired already filtered out in data loading)
    if (filters.status !== 'all') {
      filtered = filtered.filter(bounty => {
        const { isExpired } = getBountyExpirationInfo(bounty.deadline);
        
        switch (filters.status) {
          case 'open':
            return bounty.status === 'open' && !isExpired;
          case 'in-progress': 
            return bounty.status === 'in-progress';
          case 'completed':
            return bounty.status === 'completed';
          case 'cancelled':
            return bounty.status === 'cancelled';
          default:
            return true;
        }
      });
    }
    // Apply search filter
    filtered = searchBounties(filtered, filters.search);

    setFilteredBounties(filtered);
  }, [allBounties, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApplyToBounty = (bounty) => {
    // TODO: Implement application functionality
    alert(`Application feature coming soon for: ${bounty.title}`);
  };

  const createSampleBounty = () => {
    if (session?.user?.email) {
      const sampleBounty = {
        title: 'Build a Modern E-commerce Website',
        description: 'We need a full-stack e-commerce website with modern design, payment integration, and admin panel. The project should include user authentication, product catalog, shopping cart, and order management.',
        categories: ['web-development', 'ui-ux-design'], // Multiple categories
        difficulty: 'intermediate',
        budget: 2500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        contact: 'john.doe@example.com or Discord: JohnDoe#1234',
        deliverables: 'Complete source code, deployed website, admin documentation',
        additionalInfo: 'Looking for someone with experience in e-commerce development. Design mockups will be provided.',
        createdBy: session.user.email
      };

      saveBounty(sampleBounty, session.user.email);
      
      // Reload bounties
      const bounties = updateExpiredBounties();
      setAllBounties(bounties);
      setFilteredBounties(bounties);
      
      alert('Sample bounty created successfully!');
    }
  };

  // Early return for loading states and unauthorized users
  if (status === 'loading' || (session && userRole === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-pink-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} relative overflow-hidden`}>
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Purple Petals Background */}
      <PurplePetals />

      {/* Main Content */}
      <div className="relative mt-10 z-10 pt-20 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-5xl font-bold bg-gradient-to-r ${themeColors.gradient} bg-clip-text text-transparent mb-4`}>
              🎯 Bounties
            </h1>
            <p className={`${themeColors.text} text-xl`}>Discover exciting challenges and earn rewards for your skills</p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className={`p-6 rounded-3xl ${themeColors.cardBg} backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card`}>
              <h3 className={`text-lg font-bold ${themeColors.filterText} mb-4`}>Filter Bounties</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className={`block ${themeColors.filterText} font-medium mb-2`}>Search</label>
                  <input
                    type="text"
                    placeholder="Search bounties..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${themeColors.border} focus:outline-none focus:ring-2 focus:${themeColors.ring} focus:border-transparent`}
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className={`block ${themeColors.filterText} font-medium mb-2`}>Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${themeColors.border} focus:outline-none focus:ring-2 focus:${themeColors.ring} focus:border-transparent`}
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
                  <label className={`block ${themeColors.filterText} font-medium mb-2`}>Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${themeColors.border} focus:outline-none focus:ring-2 focus:${themeColors.ring} focus:border-transparent`}
                  >
                    <option value="all">All Levels</option>
                    {DIFFICULTY_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter - exclude expired option for creators */}
                <div>
                  <label className={`block ${themeColors.filterText} font-medium mb-2`}>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${themeColors.border} focus:outline-none focus:ring-2 focus:${themeColors.ring} focus:border-transparent`}
                  >
                    <option value="all">All Status</option>
                    <option value="open">🟢 Open</option>
                    <option value="in-progress">🟡 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                    <option value="cancelled">🔴 Cancelled</option>
                    {/* Note: Expired bounties are filtered out automatically */}
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className={`mt-4 text-sm ${themeColors.text}`}>
                Showing {filteredBounties.length} of {allBounties.length} bounties
              </div>
            </div>
          </div>

          {/* Bounties Grid */}
          <div className="mb-8">
            {loading ? (
              <div className="text-center py-12">
                <div className={`p-6 rounded-3xl ${themeColors.cardBg} backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card`}>
                  <div className="text-4xl mb-4">⏳</div>
                  <p className={themeColors.text}>Loading bounties...</p>
                </div>
              </div>
            ) : filteredBounties.length === 0 ? (
              <div className="text-center py-12">
                <div className={`p-6 rounded-3xl ${themeColors.cardBg} backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card`}>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className={`text-xl font-bold ${themeColors.text} mb-2`}>
                    {allBounties.length === 0 ? 'No Bounties Available' : 'No Bounties Found'}
                  </h3>
                  <p className={`${themeColors.textLight} mb-6`}>
                    {allBounties.length === 0 
                      ? 'Check back soon for exciting opportunities!' 
                      : 'Try adjusting your filters to find more bounties'}
                  </p>
                  {allBounties.length === 0 && getUserRole(session) === 'bounty_poster' && (
                    <div className="space-y-3">
                      <button 
                        onClick={() => router.push('/create-bounty')}
                        className={`px-8 py-3 bg-gradient-to-r text-white rounded-xl font-semibold transition-all duration-300 mr-3 ${
                          userRole === 'bounty_poster' 
                            ? 'from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600' 
                            : 'from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600'
                        }`}
                      >
                        Be the First to Post a Bounty!
                      </button>
                      <button 
                        onClick={createSampleBounty}
                        className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-600 transition-all duration-300 text-sm"
                      >
                        Create Sample Bounty (Test)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBounties.map((bounty) => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    isOwner={false}
                    userRole={userRole}
                    onApply={userRole === 'bounty_hunter' ? handleApplyToBounty : undefined}
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

export default Bounties;

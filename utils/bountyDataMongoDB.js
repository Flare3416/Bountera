// MongoDB-based bounty data utilities using API calls
// These functions make HTTP requests to the API routes instead of direct DB access

// Categories and constants (same as localStorage version)
export const BOUNTY_CATEGORIES = [
  'Web Development',
  'Mobile Development', 
  'UI/UX Design',
  'Data Science',
  'Blockchain',
  'AI/ML',
  'DevOps',
  'Testing',
  'Documentation',
  'Other'
];

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

// Generate unique bounty ID
export const generateBountyId = () => {
  return 'bounty_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Save bounty to MongoDB via API
export const saveBounty = async (bountyData, posterEmail) => {
  try {
    const response = await fetch('/api/bounties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bountyData,
        createdBy: posterEmail,
        creator: posterEmail,
        poster: posterEmail,
        id: bountyData.id || generateBountyId(),
        status: 'active',
        migratedFrom: 'api'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Bounty saved to MongoDB:', result.data.id);
      return result.data;
    } else {
      console.error('❌ Error saving bounty:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Network error saving bounty:', error);
    throw error;
  }
};

// Get all bounties from MongoDB via API
export const getAllBounties = async () => {
  try {
    const response = await fetch('/api/bounties');
    const result = await response.json();
    
    if (result.success) {
      return result.data.map(bounty => ({
        ...bounty,
        id: bounty.id || bounty._id
      }));
    } else {
      console.error('❌ Error getting all bounties:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error getting all bounties:', error);
    return [];
  }
};

// Get bounties by user email via API
export const getUserBounties = async (email) => {
  try {
    const response = await fetch(`/api/bounties?postedBy=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data.map(bounty => ({
        ...bounty,
        id: bounty.id || bounty._id
      }));
    } else {
      console.error('❌ Error getting user bounties:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error getting user bounties:', error);
    return [];
  }
};

// Update expired bounties via API
export const updateExpiredBounties = async () => {
  try {
    const response = await fetch('/api/bounties/update-expired', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Updated ${result.count} expired bounties`);
      return result.count;
    } else {
      console.error('❌ Error updating expired bounties:', result.error);
      return 0;
    }
  } catch (error) {
    console.error('❌ Network error updating expired bounties:', error);
    return 0;
  }
};

// Get bounty by ID via API
export const getBountyById = async (bountyId) => {
  try {
    const response = await fetch(`/api/bounties?id=${encodeURIComponent(bountyId)}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        id: result.data.id || result.data._id
      };
    } else {
      console.error('❌ Error getting bounty by ID:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error getting bounty by ID:', error);
    return null;
  }
};

// Update bounty via API
export const updateBounty = async (bountyId, updatedData) => {
  try {
    const response = await fetch('/api/bounties', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: bountyId,
        ...updatedData
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Bounty updated in MongoDB:', bountyId);
      return {
        ...result.data,
        id: result.data.id || result.data._id
      };
    } else {
      console.error('❌ Error updating bounty:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error updating bounty:', error);
    return null;
  }
};

// Delete bounty via API
export const deleteBounty = async (bountyId, posterEmail) => {
  try {
    const response = await fetch('/api/bounties', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: bountyId,
        posterEmail: posterEmail
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Bounty deleted from MongoDB:', bountyId);
      return true;
    } else {
      console.error('❌ Error deleting bounty:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error deleting bounty:', error);
    return false;
  }
};

// Filter bounties by category (client-side)
export const filterBountiesByCategory = (bounties, categoryId) => {
  if (!categoryId || categoryId === 'all') return bounties;
  
  const categoryName = typeof categoryId === 'number' 
    ? BOUNTY_CATEGORIES[categoryId] 
    : categoryId;
    
  return bounties.filter(bounty => 
    bounty.category === categoryName || 
    bounty.category === categoryId
  );
};

// Filter bounties by difficulty (client-side)
export const filterBountiesByDifficulty = (bounties, difficultyId) => {
  if (!difficultyId || difficultyId === 'all') return bounties;
  return bounties.filter(bounty => bounty.difficultyLevel === difficultyId);
};

// Search bounties (client-side)
export const searchBounties = (bounties, searchTerm) => {
  if (!searchTerm) return bounties;
  
  const term = searchTerm.toLowerCase();
  return bounties.filter(bounty =>
    bounty.title?.toLowerCase().includes(term) ||
    bounty.description?.toLowerCase().includes(term) ||
    bounty.skillsRequired?.some(skill => skill.toLowerCase().includes(term)) ||
    bounty.category?.toLowerCase().includes(term)
  );
};

// Get category by ID
export const getCategoryById = (categoryId) => {
  const index = parseInt(categoryId);
  return BOUNTY_CATEGORIES[index] || categoryId;
};

// Get difficulty by ID  
export const getDifficultyById = (difficultyId) => {
  const index = parseInt(difficultyId);
  return DIFFICULTY_LEVELS[index] || difficultyId;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

// Get days until deadline
export const getDaysUntilDeadline = (deadline) => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if bounty is expired
export const isBountyExpired = (deadline) => {
  return new Date(deadline) < new Date();
};

// Get bounty expiration info
export const getBountyExpirationInfo = (deadline) => {
  const isExpired = isBountyExpired(deadline);
  const daysRemaining = getDaysUntilDeadline(deadline);
  
  return {
    isExpired,
    daysRemaining: isExpired ? 0 : daysRemaining,
    status: isExpired ? 'expired' : 
            daysRemaining <= 1 ? 'urgent' : 
            daysRemaining <= 7 ? 'warning' : 'normal'
  };
};

// Get time remaining display
export const getTimeRemainingDisplay = (deadline) => {
  const { isExpired, daysRemaining } = getBountyExpirationInfo(deadline);
  
  if (isExpired) return 'Expired';
  if (daysRemaining === 0) return 'Expires today';
  if (daysRemaining === 1) return 'Expires tomorrow';
  return `${daysRemaining} days left`;
};

// Normalize bounty data
export const normalizeBountyData = (bounty) => {
  return {
    ...bounty,
    id: bounty.id || bounty._id?.toString(),
    _id: bounty._id?.toString(),
    createdAt: bounty.createdAt || new Date(),
    updatedAt: bounty.updatedAt || new Date(),
    status: bounty.status || 'active'
  };
};

// Normalize bounty categories (handles both single category and array formats)
export const normalizeBountyCategories = (bounty) => {
  if (!bounty) return [];
  
  // If categories is already an array, return it
  if (Array.isArray(bounty.categories)) {
    return bounty.categories;
  }
  
  // If category is a single value, convert to array
  if (bounty.category) {
    return [bounty.category];
  }
  
  // If categories is a single value, convert to array
  if (bounty.categories && !Array.isArray(bounty.categories)) {
    return [bounty.categories];
  }
  
  // Default empty array
  return [];
};

// Check if user is bounty owner
export const isBountyOwner = (bounty, userEmail) => {
  return bounty.creator === userEmail || bounty.poster === userEmail || bounty.createdBy === userEmail;
};

// Get user's bounties by role
export const getUserBountiesByRole = (allBounties, userEmail, userRole) => {
  if (userRole === 'bounty_poster') {
    return allBounties.filter(bounty => isBountyOwner(bounty, userEmail));
  } else if (userRole === 'creator') {
    return allBounties.filter(bounty => 
      bounty.applicants && bounty.applicants.some(applicant => applicant.email === userEmail)
    );
  }
  return [];
};
// Bounty data management utilities

// Bounty categories/genres
export const BOUNTY_CATEGORIES = [
  { id: 'web-development', name: 'Web Development', icon: '💻', color: 'blue' },
  { id: 'mobile-development', name: 'Mobile Development', icon: '📱', color: 'green' },
  { id: 'ui-ux-design', name: 'UI/UX Design', icon: '🎨', color: 'pink' },
  { id: 'graphic-design', name: 'Graphic Design', icon: '🖼️', color: 'purple' },
  { id: 'content-writing', name: 'Content Writing', icon: '✍️', color: 'orange' },
  { id: 'video-editing', name: 'Video Editing', icon: '🎬', color: 'red' },
  { id: 'data-science', name: 'Data Science', icon: '📊', color: 'indigo' },
  { id: 'marketing', name: 'Digital Marketing', icon: '📢', color: 'yellow' },
  { id: 'photography', name: 'Photography', icon: '📸', color: 'teal' },
  { id: 'other', name: 'Other', icon: '⭐', color: 'gray' }
];

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', color: 'green' },
  { id: 'intermediate', name: 'Intermediate', color: 'yellow' },
  { id: 'advanced', name: 'Advanced', color: 'red' }
];

// Generate unique bounty ID
export const generateBountyId = () => {
  return 'bounty_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Save bounty data
export const saveBounty = (bountyData, posterEmail) => {
  try {
    const bountyId = generateBountyId();
    const bountyWithId = {
      id: bountyId,
      ...bountyData,
      creator: bountyData.creator || posterEmail, // Ensure creator field is set
      createdAt: new Date().toISOString(),
      status: 'open',
      applicants: []
    };

    // Save to all bounties list
    const allBounties = getAllBounties();
    allBounties.push(bountyWithId);
    localStorage.setItem('bountera_all_bounties', JSON.stringify(allBounties));

    // Save to poster's bounties
    const posterBounties = getUserBounties(posterEmail);
    posterBounties.push(bountyWithId);
    localStorage.setItem(`bountera_bounties_${posterEmail}`, JSON.stringify(posterBounties));

    return bountyWithId;
  } catch (error) {
    console.error('Error saving bounty:', error);
    return null;
  }
};

// Get all bounties (for creators to view)
export const getAllBounties = () => {
  try {
    const bounties = localStorage.getItem('bountera_all_bounties');
    return bounties ? JSON.parse(bounties) : [];
  } catch (error) {
    console.error('Error getting all bounties:', error);
    return [];
  }
};

// Get bounties by poster email
export const getUserBounties = (email) => {
  try {
    const bounties = localStorage.getItem(`bountera_bounties_${email}`);
    return bounties ? JSON.parse(bounties) : [];
  } catch (error) {
    console.error('Error getting user bounties:', error);
    return [];
  }
};

// Update expired bounties
export const updateExpiredBounties = () => {
  try {
    const allBounties = getAllBounties();
    let hasUpdates = false;

    const updatedBounties = allBounties.map(bounty => {
      const isExpired = isBountyExpired(bounty.deadline);
      
      // If bounty is expired but status is not 'expired' or 'completed', update it to 'expired'
      if (isExpired && bounty.status !== 'expired' && bounty.status !== 'completed') {
        hasUpdates = true;
        return { ...bounty, status: 'expired' };
      }
      
      return bounty;
    });

    // Only update localStorage if there were changes
    if (hasUpdates) {
      localStorage.setItem('bountera_all_bounties', JSON.stringify(updatedBounties));
      
      // Update each poster's bounty list as well
      const posterEmails = [...new Set(updatedBounties.map(b => b.creator))];
      posterEmails.forEach(email => {
        const posterBounties = updatedBounties.filter(b => b.creator === email);
        localStorage.setItem(`bountera_bounties_${email}`, JSON.stringify(posterBounties));
      });
    }

    return updatedBounties;
  } catch (error) {
    console.error('Error updating expired bounties:', error);
    return getAllBounties();
  }
};

// Get bounty by ID
export const getBountyById = (bountyId) => {
  try {
    const allBounties = getAllBounties();
    return allBounties.find(bounty => bounty.id === bountyId);
  } catch (error) {
    console.error('Error getting bounty by ID:', error);
    return null;
  }
};

// Update bounty
export const updateBounty = (bountyId, updatedData) => {
  try {
    const allBounties = getAllBounties();
    const bountyIndex = allBounties.findIndex(b => b.id === bountyId);
    
    if (bountyIndex === -1) {
      console.error('Bounty not found');
      return false;
    }

    // Update the bounty with new data
    allBounties[bountyIndex] = {
      ...allBounties[bountyIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    // Save updated bounties to all bounties
    localStorage.setItem('bountera_all_bounties', JSON.stringify(allBounties));

    // Update poster's bounties
    const poster = allBounties[bountyIndex].poster;
    const posterBounties = getUserBounties(poster);
    const posterBountyIndex = posterBounties.findIndex(b => b.id === bountyId);
    
    if (posterBountyIndex !== -1) {
      posterBounties[posterBountyIndex] = allBounties[bountyIndex];
      localStorage.setItem(`bountera_bounties_${poster}`, JSON.stringify(posterBounties));
    }

    return true;
  } catch (error) {
    console.error('Error updating bounty:', error);
    return false;
  }
};

// Delete bounty
export const deleteBounty = (bountyId, posterEmail) => {
  try {
    // Remove from all bounties
    const allBounties = getAllBounties();
    const filteredAllBounties = allBounties.filter(b => b.id !== bountyId);
    localStorage.setItem('bountera_all_bounties', JSON.stringify(filteredAllBounties));

    // Remove from poster's bounties
    const posterBounties = getUserBounties(posterEmail);
    const filteredPosterBounties = posterBounties.filter(b => b.id !== bountyId);
    localStorage.setItem(`bountera_bounties_${posterEmail}`, JSON.stringify(filteredPosterBounties));

    return true;
  } catch (error) {
    console.error('Error deleting bounty:', error);
    return false;
  }
};

// Filter bounties by category
export const filterBountiesByCategory = (bounties, categoryId) => {
  if (!categoryId || categoryId === 'all') return bounties;
  return bounties.filter(bounty => {
    // Handle both old single category format and new multiple categories format
    if (bounty.categories && Array.isArray(bounty.categories)) {
      return bounty.categories.includes(categoryId);
    }
    // Fallback for old format
    return bounty.category === categoryId;
  });
};

// Filter bounties by difficulty
export const filterBountiesByDifficulty = (bounties, difficultyId) => {
  if (!difficultyId || difficultyId === 'all') return bounties;
  return bounties.filter(bounty => bounty.difficulty === difficultyId);
};

// Search bounties
export const searchBounties = (bounties, searchTerm) => {
  if (!searchTerm) return bounties;
  const term = searchTerm.toLowerCase();
  return bounties.filter(bounty => 
    bounty.title.toLowerCase().includes(term) ||
    bounty.description.toLowerCase().includes(term) ||
    bounty.deliverables?.toLowerCase().includes(term) ||
    bounty.additionalInfo?.toLowerCase().includes(term)
    // Note: Not including contact in search for privacy reasons
  );
};

// Get category info by ID
export const getCategoryById = (categoryId) => {
  return BOUNTY_CATEGORIES.find(cat => cat.id === categoryId) || BOUNTY_CATEGORIES[BOUNTY_CATEGORIES.length - 1];
};

// Get difficulty info by ID
export const getDifficultyById = (difficultyId) => {
  return DIFFICULTY_LEVELS.find(diff => diff.id === difficultyId) || DIFFICULTY_LEVELS[0];
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Calculate days until deadline
export const getDaysUntilDeadline = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if bounty is expired
export const isBountyExpired = (deadline) => {
  return getDaysUntilDeadline(deadline) < 0;
};

// Centralized expiration check with detailed timing info
export const getBountyExpirationInfo = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const isExpired = diffTime < 0;
  
  return {
    isExpired,
    diffTime,
    deadlineDate,
    now
  };
};

// Get time remaining display with consistent formatting
export const getTimeRemainingDisplay = (deadline) => {
  const { isExpired, diffTime } = getBountyExpirationInfo(deadline);
  
  if (isExpired) {
    return { display: 'Expired', color: 'text-red-500', label: 'Past deadline' };
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    const color = diffDays <= 3 ? 'text-orange-500' : 'text-green-600';
    return { display: `${diffDays}d`, color, label: 'Days left' };
  } else if (diffHours > 0) {
    return { display: `${diffHours}h`, color: 'text-orange-500', label: 'Hours left' };
  } else {
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    return { display: `${diffMinutes}m`, color: 'text-red-500', label: 'Minutes left' };
  }
};

// Normalize bounty data format (handle legacy fields and ensure consistency)
export const normalizeBountyData = (bounty) => {
  return {
    ...bounty,
    creator: bounty.creator || bounty.poster || bounty.posterEmail || bounty.createdBy || 'unknown@example.com',
    categories: bounty.categories || (bounty.category ? [bounty.category] : ['Web Development']),
    contact: bounty.contact || 'No contact provided',
    status: bounty.status || 'open'
  };
};

// Check if user owns a bounty
export const isBountyOwner = (bounty, userEmail) => {
  return bounty.creator === userEmail || bounty.poster === userEmail;
};

// Get user's bounties (creator or applicant)
export const getUserBountiesByRole = (allBounties, userEmail, userRole) => {
  if (userRole === 'bounty_poster') {
    return allBounties.filter(bounty => isBountyOwner(bounty, userEmail));
  } else if (userRole === 'bounty_hunter') {
    return allBounties.filter(bounty => 
      bounty.applicants && bounty.applicants.some(applicant => applicant.email === userEmail)
    );
  }
  return [];
};

// Normalize categories to array format
export const normalizeBountyCategories = (bounty) => {
  return bounty.categories || (bounty.category ? [bounty.category] : []);
};

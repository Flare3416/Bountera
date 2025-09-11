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
      posterEmail,
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

// Update bounty
export const updateBounty = (bountyId, updatedData, posterEmail) => {
  try {
    // Update in all bounties
    const allBounties = getAllBounties();
    const allBountyIndex = allBounties.findIndex(b => b.id === bountyId);
    if (allBountyIndex !== -1) {
      allBounties[allBountyIndex] = { ...allBounties[allBountyIndex], ...updatedData };
      localStorage.setItem('bountera_all_bounties', JSON.stringify(allBounties));
    }

    // Update in poster's bounties
    const posterBounties = getUserBounties(posterEmail);
    const posterBountyIndex = posterBounties.findIndex(b => b.id === bountyId);
    if (posterBountyIndex !== -1) {
      posterBounties[posterBountyIndex] = { ...posterBounties[posterBountyIndex], ...updatedData };
      localStorage.setItem(`bountera_bounties_${posterEmail}`, JSON.stringify(posterBounties));
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

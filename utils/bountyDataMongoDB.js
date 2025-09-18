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

// Category objects with icons and colors
export const CATEGORY_CONFIG = {
  'Web Development': { icon: '💻', color: 'blue' },
  'Mobile Development': { icon: '📱', color: 'green' },
  'UI/UX Design': { icon: '🎨', color: 'pink' },
  'Data Science': { icon: '📊', color: 'purple' },
  'Blockchain': { icon: '⛓️', color: 'yellow' },
  'AI/ML': { icon: '🤖', color: 'indigo' },
  'DevOps': { icon: '⚙️', color: 'gray' },
  'Testing': { icon: '🧪', color: 'red' },
  'Documentation': { icon: '📚', color: 'orange' },
  'Other': { icon: '⭐', color: 'gray' }
};

export const DIFFICULTY_LEVELS = [
  { name: 'Beginner', color: 'green' },
  { name: 'Intermediate', color: 'blue' },
  { name: 'Advanced', color: 'orange' },
  { name: 'Expert', color: 'red' }
];

// Get difficulty names only (for backward compatibility)
export const DIFFICULTY_LEVEL_NAMES = [
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
  // If categoryId is a number (index), get the category name
  if (typeof categoryId === 'number') {
    const categoryName = BOUNTY_CATEGORIES[categoryId];
    return categoryName ? { name: categoryName, ...CATEGORY_CONFIG[categoryName] } : null;
  }
  
  // If categoryId is a string (category name), return the config
  if (typeof categoryId === 'string' && CATEGORY_CONFIG[categoryId]) {
    return { name: categoryId, ...CATEGORY_CONFIG[categoryId] };
  }
  
  // Fallback
  return categoryId;
};

// Get difficulty by ID  
export const getDifficultyById = (difficultyId) => {
  // Handle different input formats
  let difficultyName = difficultyId;
  
  // If it's a number (index), get the name from the array
  if (typeof difficultyId === 'number') {
    difficultyName = DIFFICULTY_LEVEL_NAMES[difficultyId] || 'Beginner';
  }
  
  // If it's a string that looks like a number
  if (typeof difficultyId === 'string' && !isNaN(difficultyId)) {
    const index = parseInt(difficultyId);
    difficultyName = DIFFICULTY_LEVEL_NAMES[index] || difficultyId;
  }
  
  // Find the difficulty object by name
  const difficulty = DIFFICULTY_LEVELS.find(d => d.name === difficultyName);
  
  // Return the found difficulty or a default one
  return difficulty || { name: difficultyName || 'Beginner', color: 'green' };
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
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
    status: bounty.status || 'open' // Changed from 'active' to 'open' to match enum
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

// Map skill to category based on skills data
export const getSkillToCategory = (skill) => {
  const skillToCategoryMap = {
    // Web Development
    'JavaScript': 'Web Development',
    'TypeScript': 'Web Development', 
    'React': 'Web Development',
    'Vue.js': 'Web Development',
    'Angular': 'Web Development',
    'Node.js': 'Web Development',
    'Express.js': 'Web Development',
    'Next.js': 'Web Development',
    'HTML5': 'Web Development',
    'CSS3': 'Web Development',
    'Tailwind CSS': 'Web Development',
    'Bootstrap': 'Web Development',
    'PHP': 'Web Development',
    'Laravel': 'Web Development',
    'Django': 'Web Development',
    'Flask': 'Web Development',
    'Ruby on Rails': 'Web Development',
    'ASP.NET': 'Web Development',
    
    // Mobile Development
    'React Native': 'Mobile Development',
    'Flutter': 'Mobile Development',
    'Swift': 'Mobile Development',
    'Kotlin': 'Mobile Development',
    'Java': 'Mobile Development',
    'Objective-C': 'Mobile Development',
    'Xamarin': 'Mobile Development',
    'Ionic': 'Mobile Development',
    'Cordova': 'Mobile Development',
    'Unity': 'Mobile Development',
    
    // UI/UX Design
    'Figma': 'UI/UX Design',
    'Adobe XD': 'UI/UX Design',
    'Sketch': 'UI/UX Design',
    'Photoshop': 'UI/UX Design',
    'Illustrator': 'UI/UX Design',
    'InVision': 'UI/UX Design',
    'Principle': 'UI/UX Design',
    'Framer': 'UI/UX Design',
    'Wireframing': 'UI/UX Design',
    'Prototyping': 'UI/UX Design',
    
    // Data Science
    'Python': 'Data Science',
    'R': 'Data Science',
    'SQL': 'Data Science',
    'Machine Learning': 'Data Science',
    'Deep Learning': 'Data Science',
    'TensorFlow': 'Data Science',
    'PyTorch': 'Data Science',
    'Pandas': 'Data Science',
    'NumPy': 'Data Science',
    'Scikit-learn': 'Data Science',
    'Tableau': 'Data Science',
    'Power BI': 'Data Science',
    
    // Blockchain
    'Solidity': 'Blockchain',
    'Web3.js': 'Blockchain',
    'Ethereum': 'Blockchain',
    'Smart Contracts': 'Blockchain',
    'DeFi': 'Blockchain',
    'NFTs': 'Blockchain',
    'Bitcoin': 'Blockchain',
    'Hyperledger': 'Blockchain',
    'Truffle': 'Blockchain',
    'Hardhat': 'Blockchain',
    
    // DevOps
    'Docker': 'DevOps',
    'Kubernetes': 'DevOps',
    'AWS': 'DevOps',
    'Azure': 'DevOps',
    'Google Cloud': 'DevOps',
    'Jenkins': 'DevOps',
    'GitLab CI': 'DevOps',
    'Terraform': 'DevOps',
    'Ansible': 'DevOps',
    'Nginx': 'DevOps',
    
    // Testing
    'Jest': 'Testing',
    'Cypress': 'Testing',
    'Selenium': 'Testing',
    'Playwright': 'Testing',
    'Postman': 'Testing',
    'Unit Testing': 'Testing',
    'Integration Testing': 'Testing',
    'API Testing': 'Testing',
    
    // Documentation
    'Technical Writing': 'Documentation',
    'API Documentation': 'Documentation',
    'User Guides': 'Documentation',
    'Markdown': 'Documentation',
    
    // Other
    'Voice Actor & Narrator': 'Other',
    'Content Creation': 'Other',
    'Video Editing': 'Other',
    'Audio Production': 'Other',
    'Creative Writing': 'Other',
    'Professional Photographer': 'UI/UX Design', // Photography is creative/visual
    'Photography': 'UI/UX Design',
    'Photo Editing': 'UI/UX Design'
  };
  
  return skillToCategoryMap[skill] || 'Web Development'; // Default fallback
};

// Get primary category from bounty (supports both skills and categories)
export const getBountyPrimaryCategory = (bounty) => {
  if (!bounty) return null;
  
  // First check if bounty has skillsRequired (new format)
  if (bounty.skillsRequired && Array.isArray(bounty.skillsRequired) && bounty.skillsRequired.length > 0) {
    const primarySkill = bounty.skillsRequired[0];
    
    // Extract emoji from skill name if it exists (e.g., "📸 Professional Photographer")
    const emojiMatch = primarySkill.match(/^(\p{Emoji})\s*/u);
    if (emojiMatch) {
      const skillEmoji = emojiMatch[1];
      const skillName = primarySkill.replace(/^(\p{Emoji})\s*/u, '');
      
      // Return a custom category object with the skill's emoji
      return {
        name: skillName,
        icon: skillEmoji,
        color: 'purple' // Default color
      };
    }
    
    // Fallback to category mapping if no emoji in skill name
    const categoryName = getSkillToCategory(primarySkill);
    const category = getCategoryById(categoryName);
    
    return category;
  }
  
  // Fallback to old categories format
  const categories = normalizeBountyCategories(bounty);
  if (categories.length > 0) {
    const category = getCategoryById(categories[0]);
    return category;
  }
  
  return null;
};

// Check if user is bounty owner
export const isBountyOwner = async (bounty, userEmail) => {
  // Check if bounty.postedBy is populated with user object
  if (bounty.postedBy && typeof bounty.postedBy === 'object' && bounty.postedBy.email) {
    return bounty.postedBy.email === userEmail;
  }
  
  // If postedBy is just an ObjectId, we need to get the user data
  if (bounty.postedBy && typeof bounty.postedBy === 'string') {
    try {
      // Get user data from API to compare email
      const response = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
      const userData = await response.json();
      
      if (userData.success && userData.data) {
        return userData.data._id === bounty.postedBy;
      }
    } catch (error) {
      console.error('Error checking bounty ownership:', error);
    }
  }
  
  // Fallback: check legacy fields for older bounties
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
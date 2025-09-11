// User data management utility
export const getUserData = (email) => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem(`user_${email}`);
  return userData ? JSON.parse(userData) : null;
};

export const saveUserData = (email, data) => {
  if (typeof window === 'undefined') return;
  
  const existingData = getUserData(email) || {};
  
  // Ensure arrays are properly initialized
  const updatedData = { 
    ...existingData, 
    ...data, 
    email,
    role: data.role || existingData.role || null, // Add role support
    experience: Array.isArray(data.experience) ? data.experience : (existingData.experience || []),
    projects: Array.isArray(data.projects) ? data.projects : (existingData.projects || []),
    achievements: Array.isArray(data.achievements) ? data.achievements : (existingData.achievements || []),
    socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : (existingData.socialLinks || []),
    skills: Array.isArray(data.skills) ? data.skills : (existingData.skills || [])
  };
  
  try {
    localStorage.setItem(`user_${email}`, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    // Re-throw storage errors with proper error names
    if (error.name === 'QuotaExceededError' || 
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.message.toLowerCase().includes('quota') ||
        error.message.toLowerCase().includes('storage')) {
      const quotaError = new Error('Storage quota exceeded. Please try with smaller images.');
      quotaError.name = 'QuotaExceededError';
      throw quotaError;
    }
    throw error;
  }
};

// Set user role
export const setUserRole = (email, role) => {
  return saveUserData(email, { role });
};

// Get user role
export const getUserRole = (session) => {
  if (!session?.user?.email) return null;
  const userData = getUserData(session.user.email);
  return userData?.role || null;
};

// Check if user has selected a role
export const hasUserRole = (session) => {
  return getUserRole(session) !== null;
};

export const updateUserProfile = (email, profileData) => {
  return saveUserData(email, {
    ...profileData,
    profileCompleted: true,
    lastUpdated: new Date().toISOString()
  });
};

export const isProfileCompleted = (email) => {
  const userData = getUserData(email);
  return userData?.profileCompleted || false;
};

export const getUserDisplayName = (session) => {
  if (!session?.user?.email) return session?.user?.name || 'User';
  
  const userData = getUserData(session.user.email);
  return userData?.name || session.user.name || 'User';
};

export const getUserProfileImage = (session) => {
  if (!session?.user?.email) return session?.user?.image;
  
  const userData = getUserData(session.user.email);
  return userData?.profileImage || session.user.image;
};

export const getUserBackgroundImage = (session) => {
  if (!session?.user?.email) return null;
  
  const userData = getUserData(session.user.email);
  return userData?.backgroundImage;
};

// Helper functions to get user info by email (for bounty cards)
export const getUserDisplayNameByEmail = (email) => {
  if (!email) return 'Anonymous User';
  
  const userData = getUserData(email);
  return userData?.name || email.split('@')[0] || 'User';
};

export const getUserProfileImageByEmail = (email) => {
  if (!email) return null;
  
  const userData = getUserData(email);
  return userData?.profileImage || null;
};

export const getAllUserData = (session) => {
  if (!session?.user?.email) return null;
  
  const userData = getUserData(session.user.email);
  if (!userData) return null;
  
  // Ensure all required fields exist with proper defaults
  return {
    ...userData,
    experience: Array.isArray(userData.experience) ? userData.experience : [],
    projects: Array.isArray(userData.projects) ? userData.projects : [],
    achievements: Array.isArray(userData.achievements) ? userData.achievements : [],
    socialLinks: Array.isArray(userData.socialLinks) ? userData.socialLinks : [],
    skills: Array.isArray(userData.skills) ? userData.skills : [],
    name: userData.name || '',
    bio: userData.bio || ''
  };
};

// Clean up any blob URLs from localStorage (from previous versions)
export const cleanupBlobUrls = (email) => {
  const userData = getUserData(email);
  if (!userData) return;

  let needsUpdate = false;
  const cleanedData = { ...userData };

  // Clean up blob URLs
  if (userData.profileImage && userData.profileImage.startsWith('blob:')) {
    cleanedData.profileImage = null;
    needsUpdate = true;
  }

  if (userData.backgroundImage && userData.backgroundImage.startsWith('blob:')) {
    cleanedData.backgroundImage = null;
    needsUpdate = true;
  }

  if (userData.projects) {
    cleanedData.projects = userData.projects.map(project => {
      if (project.image && project.image.startsWith('blob:')) {
        needsUpdate = true;
        return { ...project, image: '' };
      }
      return project;
    });
  }

  // Ensure new fields exist for existing users
  if (!Array.isArray(cleanedData.experience)) {
    cleanedData.experience = [];
    needsUpdate = true;
  }

  if (!Array.isArray(cleanedData.projects)) {
    cleanedData.projects = [];
    needsUpdate = true;
  }

  if (!Array.isArray(cleanedData.achievements)) {
    cleanedData.achievements = [];
    needsUpdate = true;
  }

  if (!Array.isArray(cleanedData.socialLinks)) {
    cleanedData.socialLinks = [];
    needsUpdate = true;
  }

  if (needsUpdate) {
    saveUserData(email, cleanedData);
  }
};

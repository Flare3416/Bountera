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
    experience: Array.isArray(data.experience) ? data.experience : (existingData.experience || []),
    projects: Array.isArray(data.projects) ? data.projects : (existingData.projects || []),
    achievements: Array.isArray(data.achievements) ? data.achievements : (existingData.achievements || []),
    socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : (existingData.socialLinks || []),
    skills: Array.isArray(data.skills) ? data.skills : (existingData.skills || [])
  };
  
  localStorage.setItem(`user_${email}`, JSON.stringify(updatedData));
  return updatedData;
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

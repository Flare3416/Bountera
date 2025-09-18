// MongoDB-based user data utilities
// These functions make API calls and are safe for client-side use

// Save user data to MongoDB via API
export const saveUserData = async (email, userData) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        ...userData,
        migratedFrom: 'localStorage'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('❌ Error saving user data:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error saving user data:', error);
    return null;
  }
};

// Get user data from MongoDB via API
export const getUserData = async (email) => {
  try {
    const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user data from MongoDB:', error);
    return null;
  }
};

// Get all users data from MongoDB via API
export const getAllUsersData = async () => {
  try {
    const response = await fetch('/api/users');
    const result = await response.json();
    
    if (result.success) {
      // Convert array to object with email as key for compatibility
      const usersObject = {};
      result.data.forEach(user => {
        if (user.email) {
          usersObject[user.email] = user;
        }
      });
      return usersObject;
    } else {
      console.error('❌ Error getting all users data:', result.error);
      return {};
    }
  } catch (error) {
    console.error('❌ Network error getting all users data:', error);
    return {};
  }
};

// Get user role from MongoDB via API
export const getUserRole = async (email) => {
  try {
    const userData = await getUserData(email);
    return userData?.role || 'creator';
  } catch (error) {
    return 'creator';
  }
};

// Update user data in MongoDB via API
export const updateUserData = async (email, updatedData) => {
  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        ...updatedData,
        updatedAt: new Date()
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('❌ Error updating user data:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error updating user data:', error);
    return null;
  }
};

// Helper function for blob URL cleanup (client-side only)
export const cleanupBlobUrls = () => {
  // This is a client-side utility for cleaning up blob URLs
  // No MongoDB operation needed
};

// Get all user data (alias for compatibility)
export const getAllUserData = getAllUsersData;

// Get user display name from session (client-side helper)
export const getUserDisplayName = (session) => {
  if (!session?.user?.email) return session?.user?.name || 'User';
  // For this client-side function, we'll use session data as fallback
  // In a real implementation, you might want to fetch from API asynchronously
  return session?.user?.name || 'User';
};

// Get user profile image from session (client-side helper)
export const getUserProfileImage = (session) => {
  if (!session?.user?.email) return session?.user?.image;
  // For this client-side function, we'll use session data as fallback
  // In a real implementation, you might want to fetch from API asynchronously
  return session?.user?.image;
};

// Get user background image from session (client-side helper)
export const getUserBackgroundImage = (session) => {
  if (!session?.user?.email) return null;
  // This would need to be fetched from the API asynchronously in a real implementation
  return null;
};

// Get user display name by email (requires async API call)
export const getUserDisplayNameByEmail = async (email) => {
  try {
    const userData = await getUserData(email);
    return userData?.name || 'Anonymous User';
  } catch (error) {
    return 'Anonymous User';
  }
};

// Get user profile image by email (requires async API call)
export const getUserProfileImageByEmail = async (email) => {
  try {
    const userData = await getUserData(email);
    return userData?.profileImage || null;
  } catch (error) {
    return null;
  }
};

// Get user background image by email (requires async API call)
export const getUserBackgroundImageByEmail = async (email) => {
  try {
    const userData = await getUserData(email);
    return userData?.backgroundImage || null;
  } catch (error) {
    return null;
  }
};

// Update user profile image via API
export const updateUserProfileImage = async (email, imageData) => {
  try {
    return await updateUserData(email, {
      profileImage: imageData.profileImage,
      profileImageType: imageData.profileImageType || 'upload'
    });
  } catch (error) {
    return null;
  }
};

// Update user background image via API
export const updateUserBackgroundImage = async (email, imageData) => {
  try {
    return await updateUserData(email, {
      backgroundImage: imageData.backgroundImage,
      backgroundImageType: imageData.backgroundImageType || 'upload'
    });
  } catch (error) {
    return null;
  }
};
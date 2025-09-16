// Storage management utilities for Bountera

export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

export const getStorageInfo = () => {
  const used = getStorageUsage();
  const limit = 5 * 1024 * 1024; // 5MB typical limit
  const percentage = (used / limit) * 100;
  
  return {
    used,
    limit,
    percentage: Math.min(percentage, 100),
    usedMB: (used / 1024 / 1024).toFixed(2),
    limitMB: (limit / 1024 / 1024).toFixed(2)
  };
};

export const attemptStorageWithCleanup = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.log('Storage quota exceeded, attempting cleanup...');
      
      // Try cleanup
      const cleanedUp = cleanupOldImages();
      
      if (cleanedUp) {
        try {
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (secondError) {
          console.error('Still quota exceeded after cleanup');
          return false;
        }
      } else {
        console.error('No cleanup possible, storage full');
        return false;
      }
    }
    throw error;
  }
};

export const cleanupOldImages = () => {
  try {
    const allBounties = JSON.parse(localStorage.getItem('bountera_all_bounties') || '[]');
    let cleaned = false;
    
    // Remove images from bounties older than 30 days that are completed/cancelled
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cleanedBounties = allBounties.map(bounty => {
      const bountyDate = new Date(bounty.createdAt);
      const isOld = bountyDate < thirtyDaysAgo;
      const isCompleted = ['completed', 'cancelled', 'expired'].includes(bounty.status);
      
      if (isOld && isCompleted && bounty.referenceImages && bounty.referenceImages.length > 0) {
        cleaned = true;
        return { ...bounty, referenceImages: [] };
      }
      return bounty;
    });
    
    if (cleaned) {
      localStorage.setItem('bountera_all_bounties', JSON.stringify(cleanedBounties));
      console.log('Cleaned up old images from completed bounties');
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error during cleanup:', error);
    return false;
  }
};

export const isStorageHigh = () => {
  const info = getStorageInfo();
  return info.percentage > 80;
};

export const forceCleanupIfNeeded = () => {
  if (isStorageHigh()) {
    console.log('Storage usage high, performing automatic cleanup...');
    cleanupOldImages();
    return true;
  }
  return false;
};
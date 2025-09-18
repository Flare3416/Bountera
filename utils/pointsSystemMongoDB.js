// MongoDB-based points system utilities using API calls
// These functions make HTTP requests to the API routes instead of direct DB access

// Point values for different activities
export const POINT_VALUES = {
  DAILY_LOGIN: 1,
  PROFILE_COMPLETION: 10,
  BOUNTY_APPLICATION: 5,
  BOUNTY_COMPLETION: 100
};

// Activity types
export const ACTIVITY_TYPES = {
  DAILY_LOGIN: 'daily_login',
  PROFILE_COMPLETION: 'profile_completion',
  BOUNTY_APPLICATION: 'bounty_application',
  BOUNTY_COMPLETION: 'bounty_completion'
};

// Get user points via API (from User collection)
export const getUserPoints = async (email) => {
  try {
    const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data.points || 0;
    } else {
      console.warn('User points not found:', email);
      return 0;
    }
  } catch (error) {
    console.error('❌ Error getting user points:', error);
    return 0;
  }
};

// Get user rank via API (calculated from User collection)
export const getUserRank = async (email) => {
  try {
    // Get all creators sorted by points
    const response = await fetch('/api/leaderboard');
    const result = await response.json();
    
    if (result.success) {
      const creators = result.data;
      const userIndex = creators.findIndex(creator => creator.email === email);
      return userIndex >= 0 ? userIndex + 1 : 0;
    } else {
      console.warn('Could not get user rank:', email);
      return 0;
    }
  } catch (error) {
    console.error('❌ Error getting user rank:', error);
    return 0;
  }
};

// Award points for activities via API
export const awardPoints = async (email, activityType, points, description = '') => {
  try {
    const response = await fetch('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        activityType,
        points,
        description
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Awarded ${points} points to ${email} for ${activityType}`);
      return result.data;
    } else {
      console.error('❌ Error awarding points:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error awarding points:', error);
    return null;
  }
};

// Award daily login points via API
export const awardDailyLoginPoints = async (email) => {
  try {
    const response = await fetch('/api/points/daily-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Daily login points awarded to ${email}`);
      return result.data;
    } else {
      console.log(`ℹ️ Daily login points already awarded today for ${email}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error awarding daily login points:', error);
    return null;
  }
};

// Award completion points via API
export const awardCompletionPoints = async (email, bountyTitle = '') => {
  return await awardPoints(
    email, 
    ACTIVITY_TYPES.BOUNTY_COMPLETION, 
    POINT_VALUES.BOUNTY_COMPLETION,
    `Completed bounty: ${bountyTitle}`
  );
};

// Award application points via API
export const awardApplicationPoints = async (email, bountyTitle = '') => {
  return await awardPoints(
    email, 
    ACTIVITY_TYPES.BOUNTY_APPLICATION, 
    POINT_VALUES.BOUNTY_APPLICATION,
    `Applied to bounty: ${bountyTitle}`
  );
};

// Award profile completion points via API
export const awardProfileCompletionPoints = async (email) => {
  return await awardPoints(
    email, 
    ACTIVITY_TYPES.PROFILE_COMPLETION, 
    POINT_VALUES.PROFILE_COMPLETION,
    'Profile completion bonus'
  );
};

// Get leaderboard via API (from User collection)
export const getLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('❌ Error getting leaderboard:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error getting leaderboard:', error);
    return [];
  }
};

// Get user points and rank combined
export const getUserPointsAndRank = async (email) => {
  try {
    const [points, rank] = await Promise.all([
      getUserPoints(email),
      getUserRank(email)
    ]);
    
    return {
      points: points || 0,
      rank: rank || 0,
      email
    };
  } catch (error) {
    console.error('❌ Error getting user points and rank:', error);
    return {
      points: 0,
      rank: 0,
      email
    };
  }
};

// Award retroactive points for existing users
export const awardRetroactivePoints = async (email) => {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      const user = result.data;
      
      // Check if user has completed profile but has 0 points
      if (user.role === 'creator' && user.username && user.points === 0) {
        // Award profile completion points directly via daily login (which now handles this)
        return await awardDailyLoginPoints(email);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error awarding retroactive points:', error);
    return null;
  }
};
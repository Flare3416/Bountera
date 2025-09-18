// MongoDB-based activity system utilities using API calls
// These functions make HTTP requests to the API routes instead of direct DB access

// Activity types
export const ACTIVITY_TYPES = {
  PROFILE_UPDATE: 'profile_update',
  BOUNTY_POSTED: 'bounty_posted',
  BOUNTY_APPLICATION: 'bounty_application',
  BOUNTY_COMPLETION: 'bounty_completion',
  DAILY_LOGIN: 'daily_login',
  DONATION_RECEIVED: 'donation_received',
  PROFILE_COMPLETION: 'profile_completion'
};

// Log activity via API
export const logActivity = async (email, activityType, description = '', metadata = {}) => {
  try {
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        activityType,
        description,
        metadata
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Activity logged for ${email}: ${activityType}`);
      return result.data;
    } else {
      console.error('❌ Error logging activity:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error logging activity:', error);
    return null;
  }
};

// Get user activities via API
export const getUserActivities = async (email, limit = 10) => {
  try {
    const response = await fetch(`/api/activities?email=${encodeURIComponent(email)}&limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.warn('User activities not found:', email);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting user activities:', error);
    return [];
  }
};

// Get all activities (for admin/analytics) via API
export const getAllActivities = async (limit = 50) => {
  try {
    const response = await fetch(`/api/activities?limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.error('❌ Error getting all activities:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error getting all activities:', error);
    return [];
  }
};

// Get activity stats via API
export const getActivityStats = async (email) => {
  try {
    const response = await fetch(`/api/activities/stats?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || {
        totalActivities: 0,
        activitiesByType: {},
        recentActivities: []
      };
    } else {
      console.warn('Activity stats not found:', email);
      return {
        totalActivities: 0,
        activitiesByType: {},
        recentActivities: []
      };
    }
  } catch (error) {
    console.error('❌ Error getting activity stats:', error);
    return {
      totalActivities: 0,
      activitiesByType: {},
      recentActivities: []
    };
  }
};

// Helper function to format activity description
export const formatActivityDescription = (activity) => {
  switch (activity.activityType) {
    case ACTIVITY_TYPES.PROFILE_UPDATE:
      return 'Updated profile information';
    case ACTIVITY_TYPES.BOUNTY_POSTED:
      return `Posted bounty: ${activity.metadata?.bountyTitle || 'New bounty'}`;
    case ACTIVITY_TYPES.BOUNTY_APPLICATION:
      return `Applied to bounty: ${activity.metadata?.bountyTitle || 'Bounty'}`;
    case ACTIVITY_TYPES.BOUNTY_COMPLETION:
      return `Completed bounty: ${activity.metadata?.bountyTitle || 'Bounty'}`;
    case ACTIVITY_TYPES.DAILY_LOGIN:
      return 'Daily login bonus earned';
    case ACTIVITY_TYPES.DONATION_RECEIVED:
      return `Received donation: $${activity.metadata?.amount || '0'}`;
    case ACTIVITY_TYPES.PROFILE_COMPLETION:
      return 'Completed profile setup';
    default:
      return activity.description || 'Activity performed';
  }
};

// Helper function to get activity icon
export const getActivityIcon = (activityType) => {
  switch (activityType) {
    case ACTIVITY_TYPES.PROFILE_UPDATE:
      return '👤';
    case ACTIVITY_TYPES.BOUNTY_POSTED:
      return '📋';
    case ACTIVITY_TYPES.BOUNTY_APPLICATION:
      return '🎯';
    case ACTIVITY_TYPES.BOUNTY_COMPLETION:
      return '✅';
    case ACTIVITY_TYPES.DAILY_LOGIN:
      return '🌸';
    case ACTIVITY_TYPES.DONATION_RECEIVED:
      return '💝';
    case ACTIVITY_TYPES.PROFILE_COMPLETION:
      return '🎉';
    default:
      return '📌';
  }
};
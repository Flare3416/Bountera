// Activity logging utilities for tracking user actions

// Activity types
export const ACTIVITY_TYPES = {
  BOUNTY_CREATED: 'bounty_created',
  BOUNTY_UPDATED: 'bounty_updated',
  BOUNTY_DELETED: 'bounty_deleted',
  BOUNTY_COMPLETED: 'bounty_completed',
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected'
};

// Generate activity ID
export const generateActivityId = () => {
  return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Log activity
export const logActivity = (userEmail, activityType, data = {}) => {
  try {
    const activity = {
      id: generateActivityId(),
      type: activityType,
      timestamp: new Date().toISOString(),
      data,
      userEmail
    };

    // Get existing activities for user
    const activities = getUserActivities(userEmail);
    activities.unshift(activity); // Add to beginning for chronological order

    // Keep only last 50 activities to prevent storage bloat
    const trimmedActivities = activities.slice(0, 50);

    // Save back to localStorage
    localStorage.setItem(`bountera_activities_${userEmail}`, JSON.stringify(trimmedActivities));

    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
};

// Get user activities
export const getUserActivities = (userEmail) => {
  try {
    const activities = localStorage.getItem(`bountera_activities_${userEmail}`);
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error('Error getting user activities:', error);
    return [];
  }
};

// Format activity for display
export const formatActivityMessage = (activity) => {
  const { type, data, timestamp } = activity;
  const date = new Date(timestamp).toLocaleDateString();
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  switch (type) {
    case ACTIVITY_TYPES.BOUNTY_CREATED:
      const categoryDisplay = data.categories && Array.isArray(data.categories) 
        ? data.categories.join(', ') 
        : (data.category || 'General');
      return {
        icon: '🎯',
        message: `Created bounty "${data.title}"`,
        submessage: `Budget: $${data.budget} • Categories: ${categoryDisplay}`,
        timestamp: `${date} at ${time}`,
        color: 'green'
      };
    case ACTIVITY_TYPES.BOUNTY_UPDATED:
      return {
        icon: '✏️',
        message: `Updated bounty "${data.title}"`,
        submessage: 'Bounty details have been modified',
        timestamp: `${date} at ${time}`,
        color: 'blue'
      };
    case ACTIVITY_TYPES.BOUNTY_DELETED:
      return {
        icon: '🗑️',
        message: `Deleted bounty "${data.title}"`,
        submessage: 'Bounty has been removed',
        timestamp: `${date} at ${time}`,
        color: 'red'
      };
    case ACTIVITY_TYPES.APPLICATION_RECEIVED:
      return {
        icon: '📨',
        message: `Received application for "${data.bountyTitle}"`,
        submessage: `From: ${data.applicantName}`,
        timestamp: `${date} at ${time}`,
        color: 'purple'
      };
    default:
      return {
        icon: '📋',
        message: 'Activity logged',
        submessage: '',
        timestamp: `${date} at ${time}`,
        color: 'gray'
      };
  }
};

// Clear old activities (optional utility)
export const clearOldActivities = (userEmail, daysToKeep = 30) => {
  try {
    const activities = getUserActivities(userEmail);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredActivities = activities.filter(activity => 
      new Date(activity.timestamp) > cutoffDate
    );

    localStorage.setItem(`bountera_activities_${userEmail}`, JSON.stringify(filteredActivities));
    return true;
  } catch (error) {
    console.error('Error clearing old activities:', error);
    return false;
  }
};
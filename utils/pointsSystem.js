// Points system for creator leaderboard
import { getUserData, saveUserData } from './userData';
import { logActivity, ACTIVITY_TYPES } from './activityData';
import { APPLICATION_STATUS } from './applicationData';

// Point values for different activities
export const POINT_VALUES = {
  DAILY_LOGIN: 1,
  BOUNTY_APPLICATION: 5,
  BOUNTY_COMPLETION: 100, // When a bounty creator worked on is completed
  PROFILE_COMPLETION: 10, // One-time bonus for completing profile
  FIRST_APPLICATION: 15, // Bonus for first application
};

// Get user's current points
export const getUserPoints = (userEmail) => {
  try {
    const userData = getUserData(userEmail);
    return userData?.points || 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
};

// Award points to a user
export const awardPoints = (userEmail, pointValue, reason, activityType = null) => {
  try {
    const userData = getUserData(userEmail);
    if (!userData) {
      console.error('User not found for points award:', userEmail);
      return false;
    }

    const currentPoints = userData.points || 0;
    const newPoints = currentPoints + pointValue;

    // Update user data with new points
    const updatedData = saveUserData(userEmail, { 
      points: newPoints,
      lastPointsUpdate: new Date().toISOString()
    });

    // Log the activity only if activityType is provided
    if (activityType) {
      logActivity(userEmail, activityType, {
        pointsAwarded: pointValue,
        totalPoints: newPoints,
        reason: reason
      });
    }

    console.log(`Points awarded: ${pointValue} to ${userEmail} for ${reason}. Total: ${newPoints}`);
    return updatedData;
  } catch (error) {
    console.error('Error awarding points:', error);
    return false;
  }
};

// Award daily login points (only once per day)
export const awardDailyLoginPoints = (userEmail) => {
  try {
    const userData = getUserData(userEmail);
    if (!userData) return false;

    const today = new Date().toDateString();
    const lastLoginDate = userData.lastLoginDate;

    // Check if user already got points today
    if (lastLoginDate === today) {
      return false; // Already awarded today
    }

    // Update last login date
    saveUserData(userEmail, { 
      lastLoginDate: today 
    });

    // Award points
    return awardPoints(
      userEmail, 
      POINT_VALUES.DAILY_LOGIN, 
      'Daily login bonus',
      ACTIVITY_TYPES.DAILY_LOGIN
    );
  } catch (error) {
    console.error('Error awarding daily login points:', error);
    return false;
  }
};

// Award points for bounty application
export const awardApplicationPoints = (userEmail, bountyId, bountyTitle) => {
  try {
    const userData = getUserData(userEmail);
    if (!userData) return false;

    // Just award the standard application points (no first application bonus)
    const totalPoints = POINT_VALUES.BOUNTY_APPLICATION; // Always 5 points

    // Mark that they have applied before (for tracking purposes)
    if (!userData.hasAppliedBefore) {
      saveUserData(userEmail, { hasAppliedBefore: true });
    }

    return awardPoints(
      userEmail,
      totalPoints,
      `Applied to bounty: ${bountyTitle}`,
      ACTIVITY_TYPES.BOUNTY_APPLIED
    );
  } catch (error) {
    console.error('Error awarding application points:', error);
    return false;
  }
};

// Award points for bounty completion
export const awardCompletionPoints = (userEmail, bountyId, bountyTitle) => {
  try {
    return awardPoints(
      userEmail,
      POINT_VALUES.BOUNTY_COMPLETION,
      `Bounty completed: ${bountyTitle}`,
      ACTIVITY_TYPES.BOUNTY_COMPLETED
    );
  } catch (error) {
    console.error('Error awarding completion points:', error);
    return false;
  }
};

// Get user's rank in leaderboard
export const getUserRank = (userEmail) => {
  try {
    const allCreators = [];
    
    // Get all creators from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_') && key.includes('@')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.role === 'creator' && data.name) {
            allCreators.push({
              email: key.replace('user_', ''),
              points: data.points || 0
            });
          }
        } catch (e) {
          // Skip invalid data
        }
      }
    }

    // Sort by points
    allCreators.sort((a, b) => b.points - a.points);

    // Find user's rank
    const userIndex = allCreators.findIndex(creator => creator.email === userEmail);
    return userIndex !== -1 ? userIndex + 1 : null;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

// Get leaderboard data
export const getLeaderboardData = () => {
  try {
    const allCreators = [];
    
    // Get all creators from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_') && key.includes('@')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.role === 'creator' && data.name) {
            allCreators.push({
              ...data,
              email: key.replace('user_', ''),
              points: data.points || 0
            });
          }
        } catch (e) {
          // Skip invalid data
        }
      }
    }

    // Sort by points (highest first), then by join date (newest first)
    allCreators.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
    });

    // Assign ranks
    allCreators.forEach((creator, index) => {
      creator.rank = index + 1;
    });

    return allCreators;
  } catch (error) {
    console.error('Error getting leaderboard data:', error);
    return [];
  }
};

// Migrate existing data to award retroactive points
export const migrateExistingDataPoints = () => {
  try {
    if (typeof window === 'undefined') return;
    
    console.log('Starting migration of existing data for points...');
    
    // Get all applications
    const applications = JSON.parse(localStorage.getItem('bountera_applications') || '[]');
    
    // Get all bounties  
    const bounties = JSON.parse(localStorage.getItem('bountera_all_bounties') || '[]');
    
    // Track migrations to avoid duplicates
    const migrationKey = 'bountera_points_migration_v1';
    if (localStorage.getItem(migrationKey)) {
      console.log('Migration already completed');
      return;
    }
    
    let totalPointsAwarded = 0;
    let usersUpdated = 0;
    
    // Award retroactive application points
    applications.forEach(application => {
      if (application.email) {
        const userData = getUserData(application.email);
        if (userData && userData.role === 'creator') {
          // Award application points (don't double-award first application bonus)
          awardPoints(
            application.email,
            POINT_VALUES.BOUNTY_APPLICATION,
            `Retroactive: Applied to bounty ${application.bountyId}`,
            null // Don't log activity for migrations
          );
          totalPointsAwarded += POINT_VALUES.BOUNTY_APPLICATION;
          
          // Mark that they have applied before
          saveUserData(application.email, { hasAppliedBefore: true });
        }
      }
    });
    
    // Award retroactive completion points
    const completedApplications = applications.filter(app => 
      app.status === 'completed' || app.status === APPLICATION_STATUS.COMPLETED
    );
    
    console.log(`Found ${completedApplications.length} completed applications for retroactive points`);
    
    completedApplications.forEach(application => {
      if (application.email) {
        const userData = getUserData(application.email);
        if (userData && userData.role === 'creator') {
          awardPoints(
            application.email,
            POINT_VALUES.BOUNTY_COMPLETION,
            `Retroactive: Completed bounty ${application.bountyId}`,
            null // Don't log activity for migrations
          );
          totalPointsAwarded += POINT_VALUES.BOUNTY_COMPLETION;
          usersUpdated++;
          console.log(`Awarded completion points to ${application.email}`);
        }
      }
    });
    
    // Also check for completed bounties and award points to accepted applicants
    const completedBounties = bounties.filter(bounty => bounty.status === 'completed');
    console.log(`Found ${completedBounties.length} completed bounties`);
    
    completedBounties.forEach(bounty => {
      const bountyApplications = applications.filter(app => 
        app.bountyId === bounty.id && app.status === 'accepted'
      );
      
      bountyApplications.forEach(application => {
        if (application.email) {
          const userData = getUserData(application.email);
          if (userData && userData.role === 'creator') {
            awardPoints(
              application.email,
              POINT_VALUES.BOUNTY_COMPLETION,
              `Retroactive: Completed bounty "${bounty.title}"`,
              null
            );
            totalPointsAwarded += POINT_VALUES.BOUNTY_COMPLETION;
            console.log(`Awarded completion points to ${application.email} for bounty ${bounty.title}`);
          }
        }
      });
    });
    
    // Mark migration as complete
    localStorage.setItem(migrationKey, JSON.stringify({
      completed: true,
      date: new Date().toISOString(),
      totalPointsAwarded,
      usersUpdated
    }));
    
    console.log(`Migration completed! Awarded ${totalPointsAwarded} total points to ${usersUpdated} users`);
    
  } catch (error) {
    console.error('Error during points migration:', error);
  }
};

// Reset migration (for testing purposes)
export const resetPointsMigration = () => {
  if (typeof window === 'undefined') return;
  
  // Reset migration flag
  localStorage.removeItem('bountera_points_migration_v1');
  
  // Reset all user points to 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('user_') && key.includes('@')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.role === 'creator') {
          saveUserData(key.replace('user_', ''), { 
            points: 0,
            hasAppliedBefore: false,
            lastLoginDate: null 
          });
        }
      } catch (e) {
        // Skip invalid data
      }
    }
  }
  
  console.log('Points migration reset completed');
};
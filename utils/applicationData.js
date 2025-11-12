// Application data management utilities
import { attemptStorageWithCleanup } from './storageManager';
import { awardCompletionPoints } from './pointsSystem';

// Application statuses
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted'
};

// Generate unique application ID
export const generateApplicationId = () => {
  return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get applications from localStorage
export const getApplications = () => {
  if (typeof window === 'undefined') return [];
  try {
    // Try new key first
    let applications = localStorage.getItem('bountera_applications');
    if (applications) {
      return JSON.parse(applications);
    }
    
    // If no data in new key, check old key and migrate
    const oldApplications = localStorage.getItem('applications');
    if (oldApplications) {
      const parsedOldApplications = JSON.parse(oldApplications);
      // Save to new key
      const success = attemptStorageWithCleanup('bountera_applications', JSON.parse(oldApplications));
      if (success) {
        // Remove old key
        localStorage.removeItem('applications');
        console.log('Migrated applications from old localStorage key');
      } else {
        console.error('Failed to migrate applications due to storage constraints');
      }
      return parsedOldApplications;
    }
    
    return [];
  } catch (error) {
    console.error('Error reading applications from localStorage:', error);
    return [];
  }
};

// Save applications to localStorage
export const saveApplications = (applications) => {
  if (typeof window === 'undefined') return;
  try {
    const success = attemptStorageWithCleanup('bountera_applications', applications);
    if (!success) {
      console.error('Failed to save applications due to storage constraints');
    }
  } catch (error) {
    console.error('Error saving applications to localStorage:', error);
  }
};

// Import bounty and user utilities
const getAllBounties = () => {
  if (typeof window === 'undefined') return [];
  try {
    const bounties = localStorage.getItem('bountera_all_bounties'); // Fixed: use correct key
    return bounties ? JSON.parse(bounties) : [];
  } catch (error) {
    console.error('Error reading bounties:', error);
    return [];
  }
};

const saveBounties = (bounties) => {
  if (typeof window === 'undefined') return;
  try {
    const success = attemptStorageWithCleanup('bountera_all_bounties', bounties);
    if (!success) {
      console.error('Failed to save bounties due to storage constraints');
    }
  } catch (error) {
    console.error('Error saving bounties:', error);
  }
};

const getAllUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

const saveUsers = (users) => {
  if (typeof window === 'undefined') return;
  try {
    const success = attemptStorageWithCleanup('users', users);
    if (!success) {
      console.error('Failed to save users due to storage constraints');
    }
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Apply to a bounty
export const applyToBounty = (bountyId, applicantData) => {
  try {
    const applications = getApplications();
    
    // Check if user already applied to this bounty
    const existingApplication = applications.find(
      app => app.bountyId === bountyId && app.applicantEmail === applicantData.email
    );
    
    if (existingApplication) {
      console.error('User has already applied to this bounty');
      return false;
    }

    // Create new application
    const newApplication = {
      id: generateApplicationId(),
      bountyId,
      applicantEmail: applicantData.email,
      applicantName: applicantData.name,
      applicantUsername: applicantData.username,
      applicantProfile: applicantData.image,
      status: APPLICATION_STATUS.PENDING,
      appliedAt: new Date().toISOString(),
      message: applicantData.message || ''
    };

    // Add to applications
    applications.push(newApplication);
    saveApplications(applications);

    // Dispatch custom event to notify components of application update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('applicationsUpdated', { 
        detail: { bountyId, action: 'applied' } 
      }));
    }

    return true;
  } catch (error) {
    console.error('Error applying to bounty:', error);
    return false;
  }
};

// Check if user has applied to a bounty
export const hasUserApplied = (bountyId, userEmail) => {
  try {
    const applications = getApplications();
    return applications.some(
      app => app.bountyId === bountyId && app.applicantEmail === userEmail
    );
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
};

// Get applications for a specific bounty poster
export const getApplicationsForPoster = (posterEmail) => {
  try {
    const applications = getApplications();
    const bounties = getAllBounties();
    
    // Get bounty IDs created by this poster - check all possible creator fields
    const posterBountyIds = bounties
      .filter(bounty => {
        const creator = bounty.creator || bounty.createdBy || bounty.poster || bounty.posterEmail;
        return creator === posterEmail;
      })
      .map(bounty => bounty.id);
    
    // Filter applications for these bounties
    return applications.filter(app => posterBountyIds.includes(app.bountyId));
  } catch (error) {
    console.error('Error getting applications for poster:', error);
    return [];
  }
};

// Get applications for a specific user (applicant)
export const getApplicationsForUser = (userEmail) => {
  try {
    const applications = getApplications();
    return applications.filter(app => app.applicantEmail === userEmail);
  } catch (error) {
    console.error('Error getting applications for user:', error);
    return [];
  }
};

// Accept an application
export const acceptApplication = (applicationId, bountyId) => {
  try {
    const applications = getApplications();
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      console.error('Application not found');
      return false;
    }

    // Update application status to accepted
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status: APPLICATION_STATUS.ACCEPTED,
      acceptedAt: new Date().toISOString()
    };

    // Reject all other applications for this bounty
    applications.forEach((app, index) => {
      if (app.bountyId === bountyId && app.id !== applicationId && app.status === APPLICATION_STATUS.PENDING) {
        applications[index] = {
          ...app,
          status: APPLICATION_STATUS.REJECTED,
          rejectedAt: new Date().toISOString(),
          rejectionReason: 'Another application was accepted'
        };
      }
    });

    // Update bounty status to in-progress
    const bounties = getAllBounties();
    const bountyIndex = bounties.findIndex(b => b.id === bountyId);
    
    if (bountyIndex !== -1) {
      bounties[bountyIndex] = {
        ...bounties[bountyIndex],
        status: 'in-progress',
        acceptedApplicant: applications[applicationIndex].applicantEmail
      };
      saveBounties(bounties);
    } else {
      console.error('Bounty not found for ID:', bountyId);
    }

    saveApplications(applications);

    // Dispatch custom event to notify components of status update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bountyStatusUpdated', { 
        detail: { bountyId, action: 'accepted' } 
      }));
    }

    return true;
  } catch (error) {
    console.error('Error accepting application:', error);
    return false;
  }
};

// Reject an application
export const rejectApplication = (applicationId) => {
  try {
    const applications = getApplications();
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      console.error('Application not found');
      return false;
    }

    const application = applications[applicationIndex];
    const bountyId = application.bountyId;

    // Update application status to rejected
    applications[applicationIndex] = {
      ...application,
      status: APPLICATION_STATUS.REJECTED,
      rejectedAt: new Date().toISOString()
    };

    // Check if all applications for this bounty are now rejected or completed
    const bountyApplications = applications.filter(app => app.bountyId === bountyId);
    const hasActivePendingOrAccepted = bountyApplications.some(app => 
      app.status === APPLICATION_STATUS.PENDING || 
      app.status === APPLICATION_STATUS.ACCEPTED ||
      app.status === APPLICATION_STATUS.SUBMITTED
    );

    // If no active applications remain, mark bounty as cancelled
    if (!hasActivePendingOrAccepted) {
      const bounties = getAllBounties();
      const bountyIndex = bounties.findIndex(b => b.id === bountyId);
      if (bountyIndex !== -1) {
        bounties[bountyIndex] = {
          ...bounties[bountyIndex],
          status: 'cancelled'
        };
        saveBounties(bounties);
      }
    }

    saveApplications(applications);

    // Dispatch custom event to notify components of status update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bountyStatusUpdated', { 
        detail: { bountyId, action: 'rejected' } 
      }));
    }

    return true;
  } catch (error) {
    console.error('Error rejecting application:', error);
    return false;
  }
};

// Submit completed work for a bounty
export const submitCompletedWork = (applicationId, submissionData) => {
  try {
    const applications = getApplications();
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      console.error('Application not found');
      return false;
    }

    const application = applications[applicationIndex];
    
    if (application.status !== APPLICATION_STATUS.ACCEPTED) {
      console.error('Application is not in accepted status');
      return false;
    }

    // Update application with submitted work
    applications[applicationIndex] = {
      ...application,
      status: APPLICATION_STATUS.SUBMITTED,
      submittedAt: new Date().toISOString(),
      submittedWork: submissionData.message || submissionData.description, // Accept both field names
      submissionFiles: submissionData.files || []
    };

    saveApplications(applications);
    return true;
  } catch (error) {
    console.error('Error submitting completed work:', error);
    return false;
  }
};

// Complete bounty - accept or reject submitted work
export const completeBounty = (applicationId, bountyId, isAccepted) => {
  try {
    // Get current applications
    const applications = getApplications();
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      console.error('Application not found');
      return false;
    }

    const application = applications[applicationIndex];
    
    if (application.status !== APPLICATION_STATUS.SUBMITTED) {
      console.error('Application is not in submitted status');
      return false;
    }

    if (isAccepted) {
      // Mark application as completed
      applications[applicationIndex] = {
        ...application,
        status: APPLICATION_STATUS.COMPLETED,
        completedAt: new Date().toISOString()
      };

      // Save updated applications
      saveApplications(applications);

      // Update bounty status to completed
      const bounties = getAllBounties();
      const bountyIndex = bounties.findIndex(b => b.id === bountyId);
      let bountyTitle = 'Unknown Bounty';
      if (bountyIndex !== -1) {
        bountyTitle = bounties[bountyIndex].title;
        bounties[bountyIndex] = {
          ...bounties[bountyIndex],
          status: 'completed'
        };
        saveBounties(bounties);
      }

      // Award 100 points to the creator using the points system
      if (application.applicantEmail) {
        awardCompletionPoints(application.applicantEmail, bountyId, bountyTitle);
        console.log(`Awarded 100 points to ${application.applicantEmail} for completing "${bountyTitle}"`);
      }

    } else {
      // Mark application as rejected and bounty as cancelled
      applications[applicationIndex] = {
        ...application,
        status: APPLICATION_STATUS.REJECTED,
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Work rejected by bounty poster'
      };

      // Update bounty status to cancelled
      const bounties = getAllBounties();
      const bountyIndex = bounties.findIndex(b => b.id === bountyId);
      if (bountyIndex !== -1) {
        bounties[bountyIndex] = {
          ...bounties[bountyIndex],
          status: 'cancelled'
        };
        saveBounties(bounties);
      }
    }

    // Save updated applications
    saveApplications(applications);

    // Dispatch custom event to notify components of status update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bountyStatusUpdated', { 
        detail: { bountyId, action: isAccepted ? 'completed' : 'cancelled' } 
      }));
    }

    return true;

  } catch (error) {
    console.error('Error completing bounty:', error);
    return false;
  }
};

// Get application count for a specific bounty
export const getApplicationCountForBounty = (bountyId) => {
  try {
    const applications = getApplications();
    return applications.filter(app => app.bountyId === bountyId).length;
  } catch (error) {
    console.error('Error getting application count for bounty:', error);
    return 0;
  }
};

// Get applications for a specific bounty
export const getApplicationsForBounty = (bountyId) => {
  try {
    const applications = getApplications();
    return applications.filter(app => app.bountyId === bountyId);
  } catch (error) {
    console.error('Error getting applications for bounty:', error);
    return [];
  }
};

// Migrate existing bounties to ensure creator fields are properly set
export const migrateBountiesCreatorFields = () => {
  try {
    if (typeof window === 'undefined') return;
    
    const bounties = getAllBounties();
    let migrated = false;
    
    const updatedBounties = bounties.map(bounty => {
      // If bounty doesn't have proper creator fields, try to infer them
      if (!bounty.creator && !bounty.createdBy) {
        // For existing bounties created by JuiceMaN (based on contact email pattern)
        if (bounty.contact && bounty.contact.includes('ujjwal3416@gmail.com')) {
          migrated = true;
          return {
            ...bounty,
            creator: 'ujjwal3416@gmail.com',
            createdBy: 'ujjwal3416@gmail.com'
          };
        }
      }
      
      // Ensure both creator and createdBy fields exist if one exists
      if (bounty.creator && !bounty.createdBy) {
        migrated = true;
        return { ...bounty, createdBy: bounty.creator };
      }
      
      if (bounty.createdBy && !bounty.creator) {
        migrated = true;
        return { ...bounty, creator: bounty.createdBy };
      }
      
      return bounty;
    });
    
    if (migrated) {
      const success = attemptStorageWithCleanup('bountera_all_bounties', updatedBounties);
      if (success) {
        console.log('Migrated bounty creator fields');
      } else {
        console.error('Failed to migrate bounty creator fields due to storage constraints');
      }
    }
    
    return updatedBounties;
  } catch (error) {
    console.error('Error migrating bounty creator fields:', error);
    return getAllBounties();
  }
};

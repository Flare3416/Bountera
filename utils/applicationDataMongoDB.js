// MongoDB-based application data utilities using API calls
// These functions make HTTP requests to the API routes instead of direct DB access

/**
 * Application status constants
 */
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted'
};

/**
 * MongoDB-based application data functions to replace localStorage operations
 */

// Submit completed work for an application via API
export const submitCompletedWork = async (applicationId, submissionData) => {
  try {
    const response = await fetch('/api/applications/submit-work', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId,
        submissionData
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Work submitted successfully:', result.data);
      return true;
    } else {
      console.error('❌ Error submitting work:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error submitting work:', error);
    return false;
  }
};

// Get applications for a specific user via API
export const getApplicationsForUser = async (userEmail) => {
  try {
    const response = await fetch(`/api/applications?userEmail=${encodeURIComponent(userEmail)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.warn('Applications not found for user:', userEmail);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting applications for user:', error);
    return [];
  }
};

// Save application to MongoDB via API
export const saveApplication = async (applicationData) => {
  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...applicationData,
        migratedFrom: 'localStorage'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Application saved to MongoDB:', result.data.id);
      return result.data;
    } else {
      console.error('❌ Error saving application:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error saving application:', error);
    return null;
  }
};

// Update application status via API
export const updateApplicationStatus = async (applicationId, status, updatedBy) => {
  try {
    const response = await fetch('/api/applications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: applicationId,
        status,
        updatedBy,
        updatedAt: new Date()
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Application status updated:', applicationId, status);
      return result.data;
    } else {
      console.error('❌ Error updating application status:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error updating application status:', error);
    return null;
  }
};

// Get applications for a bounty via API
export const getApplicationsForBounty = async (bountyId) => {
  try {
    const response = await fetch(`/api/applications?bountyId=${encodeURIComponent(bountyId)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.warn('Applications not found for bounty:', bountyId);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting applications for bounty:', error);
    return [];
  }
};

// Get application by ID via API
export const getApplicationById = async (applicationId) => {
  try {
    const response = await fetch(`/api/applications?id=${encodeURIComponent(applicationId)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('Application not found:', applicationId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting application by ID:', error);
    return null;
  }
};

// Delete application via API
export const deleteApplication = async (applicationId, userEmail) => {
  try {
    const response = await fetch('/api/applications', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: applicationId,
        userEmail
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Application deleted:', applicationId);
      return true;
    } else {
      console.error('❌ Error deleting application:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error deleting application:', error);
    return false;
  }
};

// Check if user has applied to bounty via API
export const hasUserAppliedToBounty = async (userEmail, bountyId) => {
  try {
    const response = await fetch(`/api/applications/check?userEmail=${encodeURIComponent(userEmail)}&bountyId=${encodeURIComponent(bountyId)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data.hasApplied || false;
    } else {
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking if user applied to bounty:', error);
    return false;
  }
};

// Get user's application statistics via API
export const getUserApplicationStats = async (userEmail) => {
  try {
    const response = await fetch(`/api/applications/stats?userEmail=${encodeURIComponent(userEmail)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('Application stats not found for user:', userEmail);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        rejected: 0
      };
    }
  } catch (error) {
    console.error('❌ Error getting user application stats:', error);
    return {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      rejected: 0
    };
  }
};

// Generate unique application ID
export const generateApplicationId = () => {
  return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Validate application data (client-side)
export const validateApplicationData = (applicationData) => {
  const required = ['bountyId', 'applicantEmail', 'coverLetter'];
  const missing = required.filter(field => !applicationData[field]);
  
  if (missing.length > 0) {
    return {
      isValid: false,
      errors: missing.map(field => `${field} is required`)
    };
  }
  
  return { isValid: true, errors: [] };
};

// Alias functions for backward compatibility
export const applyToBounty = saveApplication;
export const hasUserApplied = hasUserAppliedToBounty;

// Get application count for a bounty
export const getApplicationCountForBounty = async (bountyId) => {
  try {
    const applications = await getApplicationsForBounty(bountyId);
    return applications.length;
  } catch (error) {
    console.error('❌ Error getting application count:', error);
    return 0;
  }
};
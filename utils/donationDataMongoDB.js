// MongoDB-based donation data utilities using API calls
// These functions make HTTP requests to the API routes instead of direct DB access

/**
 * MongoDB-based donation data functions to replace localStorage operations
 */

// Save donation to MongoDB via API
export const saveDonation = async (donationData) => {
  try {
    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...donationData,
        migratedFrom: 'localStorage',
        createdAt: new Date()
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Donation saved to MongoDB:', result.data.id);
      return result.data;
    } else {
      console.error('❌ Error saving donation:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error saving donation:', error);
    return null;
  }
};

// Get all donations via API
export const getAllDonations = async () => {
  try {
    const response = await fetch('/api/donations');
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.error('❌ Error getting donations:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error getting donations:', error);
    return [];
  }
};

// Get donations by user email via API
export const getDonationsByUser = async (userEmail) => {
  try {
    const response = await fetch(`/api/donations?userEmail=${encodeURIComponent(userEmail)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.warn('Donations not found for user:', userEmail);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting donations by user:', error);
    return [];
  }
};

// Get donations by bounty ID via API
export const getDonationsByBounty = async (bountyId) => {
  try {
    const response = await fetch(`/api/donations?bountyId=${encodeURIComponent(bountyId)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.warn('Donations not found for bounty:', bountyId);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting donations by bounty:', error);
    return [];
  }
};

// Update donation status via API
export const updateDonationStatus = async (donationId, status, updatedBy) => {
  try {
    const response = await fetch('/api/donations', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: donationId,
        status,
        updatedBy,
        updatedAt: new Date()
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Donation status updated:', donationId, status);
      return result.data;
    } else {
      console.error('❌ Error updating donation status:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error updating donation status:', error);
    return null;
  }
};

// Get donation by ID via API
export const getDonationById = async (donationId) => {
  try {
    const response = await fetch(`/api/donations?id=${encodeURIComponent(donationId)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('Donation not found:', donationId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting donation by ID:', error);
    return null;
  }
};

// Delete donation via API
export const deleteDonation = async (donationId, userEmail) => {
  try {
    const response = await fetch('/api/donations', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: donationId,
        userEmail
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Donation deleted:', donationId);
      return true;
    } else {
      console.error('❌ Error deleting donation:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error deleting donation:', error);
    return false;
  }
};

// Get donation statistics via API
export const getDonationStats = async () => {
  try {
    const response = await fetch('/api/donations/stats');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('❌ Error getting donation stats:', result.error);
      return {
        totalDonations: 0,
        totalAmount: 0,
        activeCampaigns: 0
      };
    }
  } catch (error) {
    console.error('❌ Network error getting donation stats:', error);
    return {
      totalDonations: 0,
      totalAmount: 0,
      activeCampaigns: 0
    };
  }
};

// Get user donation statistics via API
export const getUserDonationStats = async (userEmail) => {
  try {
    const response = await fetch(`/api/donations/stats?userEmail=${encodeURIComponent(userEmail)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('Donation stats not found for user:', userEmail);
      return {
        totalDonated: 0,
        donationCount: 0,
        averageDonation: 0
      };
    }
  } catch (error) {
    console.error('❌ Error getting user donation stats:', error);
    return {
      totalDonated: 0,
      donationCount: 0,
      averageDonation: 0
    };
  }
};

// Generate unique donation ID
export const generateDonationId = () => {
  return 'donation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get recent donations for a user
export const getRecentDonations = async (userEmail, limit = 10) => {
  try {
    const response = await fetch(`/api/donations?recipient=${encodeURIComponent(userEmail)}&limit=${limit}&sort=recent`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.warn('Recent donations not found for user:', userEmail);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting recent donations:', error);
    return [];
  }
};

// Get donations for a specific creator (alias for getDonationsByUser)
export const getDonationsForCreator = async (userEmail) => {
  return await getDonationsByUser(userEmail);
};

// Get top donors
export const getTopDonors = async (limit = 5) => {
  try {
    const response = await fetch(`/api/donations?topDonors=true&limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      console.error('❌ Error getting top donors:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error getting top donors:', error);
    return [];
  }
};

// Format currency helper
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Validate donation data (client-side)
export const validateDonationData = (donationData) => {
  const required = ['amount', 'donorEmail', 'bountyId'];
  const missing = required.filter(field => !donationData[field]);
  
  if (missing.length > 0) {
    return {
      isValid: false,
      errors: missing.map(field => `${field} is required`)
    };
  }
  
  if (donationData.amount <= 0) {
    return {
      isValid: false,
      errors: ['Donation amount must be greater than 0']
    };
  }
  
  return { isValid: true, errors: [] };
};
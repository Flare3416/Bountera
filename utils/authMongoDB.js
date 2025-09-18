'use client';

/**
 * MongoDB-based authentication utilities for client-side operations
 * Uses API routes to interact with the database
 */

// Check if user exists in database
export async function checkUserExists(email) {
  try {
    const response = await fetch('/api/users/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    return data.exists || false;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

// Create new user in database
export async function createUser(userData) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to create user');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email) {
  try {
    const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success && data.data ? data.data : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user role
export async function updateUserRole(email, role) {
  try {
    const response = await fetch('/api/users/role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Check if user has selected a role
export function hasUserRole(session) {
  return session?.user?.role && session.user.role !== 'undefined';
}

// Get user role from session or database
export async function getUserRole(session) {
  if (session?.user?.role) {
    return session.user.role;
  }
  
  if (session?.user?.email) {
    const user = await getUserByEmail(session.user.email);
    return user?.role;
  }
  
  return null;
}

// Setup new user automatically in database
export async function setupNewUser(session) {
  if (!session?.user) {
    throw new Error('No session data provided');
  }
  
  const { email, name, image } = session.user;
  
  // Check if user already exists
  const userExists = await checkUserExists(email);
  if (userExists) {
    return await getUserByEmail(email);
  }
  
  // Create new user with basic data
  const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  const newUserData = {
    email,
    username, // Generated from email
    name: name || email.split('@')[0], // Use email prefix if no name
    avatar: image || '',
    role: null, // Will be set when user selects role
    profileCompleted: false,
    skills: [],
    bio: '',
    githubUsername: '',
    portfolioUrl: '',
    location: '',
    joinedAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  };
  
  try {
    const response = await createUser(newUserData);
    
    // Award login points for new user (non-critical operation)
    try {
      await fetch('/api/points/daily-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (pointsError) {
      console.log('Note: Could not award initial points (this is ok for new setup)');
    }
    
    return response.data; // Return the actual user data, not the response object
  } catch (error) {
    console.error('Error setting up new user:', error);
    throw error;
  }
}

// Add user to leaderboard if they're a creator
export async function addToLeaderboard(email) {
  try {
    const response = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      console.warn('Failed to add user to leaderboard:', await response.text());
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding user to leaderboard:', error);
    // Don't throw error - leaderboard addition is not critical
  }
}
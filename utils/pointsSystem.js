import { getCachedUser } from "@/lib/apiClient";

// Shared point values used across the application
export const POINT_VALUES = {
  DAILY_LOGIN: 1,
  BOUNTY_APPLICATION: 5,
  BOUNTY_COMPLETION: 100,
  PROFILE_COMPLETION: 10,
  FIRST_APPLICATION: 15,
};

/**
 * Fetch a user's current points from the shared user cache
 * (no separate network request - the user payload already includes points).
 */
export const getUserPoints = async (userEmail) => {
  try {
    const user = await getCachedUser(userEmail);
    return user?.points ?? 0;
  } catch (error) {
    console.error("Error fetching user points:", error);
    return 0;
  }
};

/**
 * Fetch a user's current leaderboard rank from the shared user cache
 * (the user payload already includes rank).
 */
export const getUserRank = async (userEmail) => {
  try {
    const user = await getCachedUser(userEmail);
    return user?.rank ?? null;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return null;
  }
};

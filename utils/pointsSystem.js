// Shared point values used across the application
export const POINT_VALUES = {
  DAILY_LOGIN: 1,
  BOUNTY_APPLICATION: 5,
  BOUNTY_COMPLETION: 100,
  PROFILE_COMPLETION: 10,
  FIRST_APPLICATION: 15,
};

/**
 * Fetch a user's current points.
 */
export const getUserPoints = async (userEmail) => {
  try {
    const res = await fetch(
      `/api/users/${encodeURIComponent(userEmail)}/points`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch user points");
    }

    const { points } = await res.json();
    return points;
  } catch (error) {
    console.error("Error fetching user points:", error);
    return 0;
  }
};

/**
 * Fetch a user's current leaderboard rank.
 */
export const getUserRank = async (userEmail) => {
  try {
    const res = await fetch(
      `/api/users/${encodeURIComponent(userEmail)}/points`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch user rank");
    }

    const { rank } = await res.json();
    return rank;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return null;
  }
};
import {
  BOUNTY_CATEGORIES,
  DIFFICULTY_LEVELS,
} from "./bountyConstants";

// Format budget
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get category by id
export const getCategoryById = (id) => {
  return BOUNTY_CATEGORIES.find((category) => category.id === id) || null;
};

// Get difficulty by id
export const getDifficultyById = (id) => {
  return (
    DIFFICULTY_LEVELS.find(
      (difficulty) => difficulty.id.toLowerCase() === id?.toLowerCase()
    ) || null
  );
};

// Normalize categories
export const normalizeBountyCategories = (bounty) => {
  if (!bounty?.categories) return [];

  if (Array.isArray(bounty.categories)) {
    return bounty.categories;
  }

  try {
    return JSON.parse(bounty.categories);
  } catch {
    return [];
  }
};

// Expiration info
export const getBountyExpirationInfo = (deadline) => {
  if (!deadline) {
    return {
      isExpired: false,
      timeRemaining: 0,
    };
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();

  const timeRemaining = deadlineDate.getTime() - now.getTime();

  return {
    isExpired: timeRemaining <= 0,
    timeRemaining,
  };
};

// Time remaining display
export const getTimeRemainingDisplay = (deadline) => {
  const { isExpired, timeRemaining } =
    getBountyExpirationInfo(deadline);

  if (isExpired) {
    return {
      display: "Expired",
      label: "Deadline",
      color: "red",
    };
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60)
  );

  if (days > 0) {
    return {
      display: `${days}d`,
      label: "Remaining",
      color: days <= 3 ? "yellow" : "green",
    };
  }

  return {
    display: `${hours}h`,
    label: "Remaining",
    color: "red",
  };
};
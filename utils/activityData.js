// Activity type constants (must match Prisma ActivityType enum)

export const ACTIVITY_TYPES = {
  BOUNTY_CREATED: "BOUNTY_CREATED",
  BOUNTY_UPDATED: "BOUNTY_UPDATED",
  BOUNTY_DELETED: "BOUNTY_DELETED",
  BOUNTY_COMPLETED: "BOUNTY_COMPLETED",
  BOUNTY_APPLIED: "BOUNTY_APPLIED",
  APPLICATION_RECEIVED: "APPLICATION_RECEIVED",
  APPLICATION_ACCEPTED: "APPLICATION_ACCEPTED",
  APPLICATION_REJECTED: "APPLICATION_REJECTED",
  DAILY_LOGIN: "DAILY_LOGIN",
  POINTS_AWARDED: "POINTS_AWARDED",
  DONATION_RECEIVED: "DONATION_RECEIVED",
  DONATION_SENT: "DONATION_SENT",
};

// Format activity for display
export const formatActivityMessage = (activity) => {
  const { type, data, createdAt, timestamp } = activity;

  const activityTime = createdAt || timestamp || new Date();

  const activityDate = new Date(activityTime);

  const date = activityDate.toLocaleDateString();

  const time = activityDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  switch (type) {
    case ACTIVITY_TYPES.BOUNTY_CREATED: {
      const categoryDisplay =
        data?.categories && Array.isArray(data.categories)
          ? data.categories.join(", ")
          : data?.category || "General";

      return {
        icon: "🎯",
        message: `Created bounty "${data?.bountyTitle || data?.title}"`,
        submessage: `Budget: $${data?.budget} • Categories: ${categoryDisplay}`,
        timestamp: `${date} at ${time}`,
        color: "green",
      };
    }

    case ACTIVITY_TYPES.BOUNTY_UPDATED:
      return {
        icon: "✏️",
        message: `Updated bounty "${data?.bountyTitle || data?.title}"`,
        submessage: "Bounty details have been modified",
        timestamp: `${date} at ${time}`,
        color: "blue",
      };

    case ACTIVITY_TYPES.BOUNTY_DELETED:
      return {
        icon: "🗑️",
        message: `Deleted bounty "${data?.bountyTitle || data?.title}"`,
        submessage: "Bounty has been removed",
        timestamp: `${date} at ${time}`,
        color: "red",
      };

    case ACTIVITY_TYPES.BOUNTY_COMPLETED:
      return {
        icon: "✅",
        message: `Completed bounty "${data?.bountyTitle || data?.title}"`,
        submessage: "Bounty marked as completed",
        timestamp: `${date} at ${time}`,
        color: "emerald",
      };

    case ACTIVITY_TYPES.BOUNTY_APPLIED:
      return {
        icon: "🚀",
        message: `Applied to "${data?.bountyTitle}"`,
        submessage: "Application submitted successfully",
        timestamp: `${date} at ${time}`,
        color: "cyan",
      };

    case ACTIVITY_TYPES.APPLICATION_RECEIVED:
      return {
        icon: "📨",
        message: `Received application for "${data?.bountyTitle}"`,
        submessage: `From: ${data?.applicantName || "Applicant"}`,
        timestamp: `${date} at ${time}`,
        color: "purple",
      };

    case ACTIVITY_TYPES.APPLICATION_ACCEPTED:
      return {
        icon: "🎉",
        message: `Accepted application for "${data?.bountyTitle}"`,
        submessage: "A creator has been selected",
        timestamp: `${date} at ${time}`,
        color: "green",
      };

    case ACTIVITY_TYPES.APPLICATION_REJECTED:
      return {
        icon: "❌",
        message: `Rejected application for "${data?.bountyTitle}"`,
        submessage: "Application was declined",
        timestamp: `${date} at ${time}`,
        color: "red",
      };

    case ACTIVITY_TYPES.DAILY_LOGIN:
      return {
        icon: "👋",
        message: "Daily login",
        submessage: "Welcome back!",
        timestamp: `${date} at ${time}`,
        color: "blue",
      };

    case ACTIVITY_TYPES.POINTS_AWARDED:
      return {
        icon: "⭐",
        message: `${data?.points || 0} points awarded`,
        submessage: data?.reason || "",
        timestamp: `${date} at ${time}`,
        color: "yellow",
      };
    
    case ACTIVITY_TYPES.DONATION_RECEIVED:
      return {
        icon: "💝",
        message: `Received $${data?.amount} donation`,
        submessage: `From: ${data?.donorName || data?.donorEmail}`,
        timestamp: `${date} at ${time}`,
        color: "emerald",
      };

    case ACTIVITY_TYPES.DONATION_SENT:
      return {
        icon: "❤️",
        message: `Sent $${data?.amount} donation`,
        submessage: `To: @${data?.recipientUsername || data?.recipientEmail}`,
        timestamp: `${date} at ${time}`,
        color: "rose",
      };

    default:
      return {
        icon: "📋",
        message: "Activity logged",
        submessage: "",
        timestamp: `${date} at ${time}`,
        color: "gray",
      };
  }
};
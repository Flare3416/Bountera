// Donation management utilities

/**
 * Get all donations
 */
export const getAllDonations = () => {
  if (typeof window === 'undefined') return [];
  const donations = localStorage.getItem('donations');
  return donations ? JSON.parse(donations) : [];
};

/**
 * Get donations received by a specific user
 */
export const getDonationsForUser = (userEmail) => {
  const allDonations = getAllDonations();
  return allDonations.filter(donation => donation.toEmail === userEmail);
};

/**
 * Get donations sent by a specific user
 */
export const getDonationsByUser = (userEmail) => {
  const allDonations = getAllDonations();
  return allDonations.filter(donation => donation.fromEmail === userEmail);
};

/**
 * Add a new donation
 */
export const addDonation = (donation) => {
  const donations = getAllDonations();
  donations.push({
    ...donation,
    id: Date.now(),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('donations', JSON.stringify(donations));
  return donation;
};

/**
 * Get total donations received by a user
 */
export const getTotalDonationsReceived = (userEmail) => {
  const donations = getDonationsForUser(userEmail);
  return donations.reduce((total, donation) => total + donation.amount, 0);
};

/**
 * Get total donations sent by a user
 */
export const getTotalDonationsSent = (userEmail) => {
  const donations = getDonationsByUser(userEmail);
  return donations.reduce((total, donation) => total + donation.amount, 0);
};

/**
 * Get top donors for a user
 */
export const getTopDonors = (userEmail, limit = 5) => {
  const donations = getDonationsForUser(userEmail);
  
  // Group donations by donor
  const donorMap = {};
  donations.forEach(donation => {
    if (!donorMap[donation.fromEmail]) {
      donorMap[donation.fromEmail] = {
        name: donation.from,
        email: donation.fromEmail,
        totalAmount: 0,
        donationCount: 0
      };
    }
    donorMap[donation.fromEmail].totalAmount += donation.amount;
    donorMap[donation.fromEmail].donationCount += 1;
  });

  // Convert to array and sort by total amount
  return Object.values(donorMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
};

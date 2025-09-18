import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Authentication & Basic Info
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  // Profile Information
  bio: { 
    type: String, 
    maxlength: 500 
  },
  profileImage: { 
    type: String 
  },
  backgroundImage: { 
    type: String 
  },
  
  // User Role & Status
  role: { 
    type: String, 
    enum: ['creator', 'bounty_poster', 'both', null], 
    default: null 
  },
  profileCompleted: { 
    type: Boolean, 
    default: false 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Role-specific Data
  creatorProfile: {
    hourlyRate: { type: Number, min: 0 },
    availability: { 
      type: String, 
      enum: ['Available', 'Busy', 'Not Available'], 
      default: 'Available' 
    },
    responseTime: { type: String }, // e.g., "Usually responds within 2 hours"
    completedBounties: { type: Number, default: 0 },
    successRate: { type: Number, default: 0, max: 100 }, // Percentage
    averageRating: { type: Number, default: 0, max: 5 },
    totalEarnings: { type: Number, default: 0 },
    preferredCategories: [{ type: String }],
    workingHours: { type: String }, // e.g., "9 AM - 6 PM IST"
    languages: [{ type: String }]
  },
  
  bountyPosterProfile: {
    companyName: { type: String },
    companySize: { 
      type: String, 
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+', 'Individual'] 
    },
    industry: { type: String },
    website: { type: String },
    linkedIn: { type: String },
    postedBounties: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, max: 5 },
    preferredBudgetRange: { 
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    paymentMethods: [{ type: String }] // 'Razorpay', 'Bank Transfer', etc.
  },
  
  // Skills & Expertise
  skills: [{ 
    type: String,
    trim: true 
  }],
  
  // Experience
  experience: [{
    title: { type: String, required: true },
    company: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String }
  }],
  
  // Projects Portfolio
  projects: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    link: { type: String },
    technologies: [{ type: String }]
  }],
  
  // Achievements
  achievements: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' }
  }],
  
  // Social Links
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String }
  }],
  
  // Points & Leaderboard
  points: { 
    type: Number, 
    default: 0 
  },
  lastLoginDate: { 
    type: Date 
  },
  activityLog: [{
    action: { type: String, required: true },
    points: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String }
  }],
  
  // Razorpay Integration (only for creators who receive payments)
  razorpayKeyId: { 
    type: String
  },
  razorpayKeySecret: { 
    type: String
  },
  
  // Statistics
  applicationStats: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 }
  },
  
  donationStats: {
    totalReceived: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    lastDonationDate: { type: Date }
  },
  
  // Bounty-related Statistics
  bountyStats: {
    // For Creators
    appliedBounties: { type: Number, default: 0 },
    wonBounties: { type: Number, default: 0 },
    completedBounties: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    
    // For Bounty Posters
    postedBounties: { type: Number, default: 0 },
    activeBounties: { type: Number, default: 0 },
    completedBounties: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  
  // Reputation & Trust
  reputation: {
    score: { type: Number, default: 0 },
    level: { 
      type: String, 
      enum: ['Newcomer', 'Rising', 'Established', 'Expert', 'Legend'], 
      default: 'Newcomer' 
    },
    badges: [{ 
      name: { type: String, required: true },
      icon: { type: String },
      earnedAt: { type: Date, default: Date.now },
      description: { type: String }
    }]
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for better performance (email and username already have unique indexes)
UserSchema.index({ role: 1 });
UserSchema.index({ points: -1 }); // For leaderboard

// Virtual for user rank (calculated field)
UserSchema.virtual('rank').get(function() {
  // This will be calculated dynamically in queries
  return this._rank || null;
});

// Methods
UserSchema.methods.addPoints = function(points, action, details = '') {
  this.points += points;
  this.activityLog.push({
    action,
    points,
    details,
    timestamp: new Date()
  });
  return this.save();
};

UserSchema.methods.updateLastLogin = function() {
  this.lastLoginDate = new Date();
  return this.save();
};

UserSchema.methods.incrementDonationStats = function(amount) {
  this.donationStats.totalReceived += amount;
  this.donationStats.totalDonations += 1;
  this.donationStats.lastDonationDate = new Date();
  return this.save();
};

// Role-specific methods
UserSchema.methods.switchToCreator = function() {
  if (this.role === 'bounty_poster') {
    this.role = 'both';
  } else {
    this.role = 'creator';
  }
  return this.save();
};

UserSchema.methods.switchToBountyPoster = function() {
  if (this.role === 'creator') {
    this.role = 'both';
  } else {
    this.role = 'bounty_poster';
  }
  return this.save();
};

UserSchema.methods.updateCreatorStats = function(type, amount = 0) {
  switch (type) {
    case 'applied':
      this.bountyStats.appliedBounties += 1;
      break;
    case 'won':
      this.bountyStats.wonBounties += 1;
      break;
    case 'completed':
      this.bountyStats.completedBounties += 1;
      this.bountyStats.totalEarnings += amount;
      this.creatorProfile.totalEarnings += amount;
      break;
  }
  return this.save();
};

UserSchema.methods.updatePosterStats = function(type, amount = 0) {
  switch (type) {
    case 'posted':
      this.bountyStats.postedBounties += 1;
      this.bountyStats.activeBounties += 1;
      break;
    case 'completed':
      this.bountyStats.completedBounties += 1;
      this.bountyStats.activeBounties -= 1;
      this.bountyStats.totalSpent += amount;
      this.bountyPosterProfile.totalSpent += amount;
      break;
    case 'cancelled':
      this.bountyStats.activeBounties -= 1;
      break;
  }
  return this.save();
};

UserSchema.methods.awardBadge = function(name, icon, description) {
  const existingBadge = this.reputation.badges.find(badge => badge.name === name);
  if (!existingBadge) {
    this.reputation.badges.push({
      name,
      icon,
      description,
      earnedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

UserSchema.methods.updateReputation = function(points) {
  this.reputation.score += points;
  
  // Update reputation level based on score
  if (this.reputation.score < 100) {
    this.reputation.level = 'Newcomer';
  } else if (this.reputation.score < 500) {
    this.reputation.level = 'Rising';
  } else if (this.reputation.score < 1500) {
    this.reputation.level = 'Established';
  } else if (this.reputation.score < 5000) {
    this.reputation.level = 'Expert';
  } else {
    this.reputation.level = 'Legend';
  }
  
  return this.save();
};

// Static methods
UserSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ role: { $in: ['creator', 'both'] }, points: { $gt: 0 } })
    .sort({ points: -1 })
    .select('username name profileImage points role reputation')
    .limit(limit);
};

UserSchema.statics.getTopCreators = function(limit = 10) {
  return this.find({ 
    role: { $in: ['creator', 'both'] },
    'creatorProfile.completedBounties': { $gt: 0 }
  })
    .sort({ 
      'creatorProfile.averageRating': -1, 
      'creatorProfile.completedBounties': -1 
    })
    .select('username name profileImage creatorProfile reputation')
    .limit(limit);
};

UserSchema.statics.getTopBountyPosters = function(limit = 10) {
  return this.find({ 
    role: { $in: ['bounty_poster', 'both'] },
    'bountyPosterProfile.postedBounties': { $gt: 0 }
  })
    .sort({ 
      'bountyPosterProfile.totalSpent': -1,
      'bountyPosterProfile.averageRating': -1 
    })
    .select('username name profileImage bountyPosterProfile')
    .limit(limit);
};

UserSchema.statics.searchCreators = function(filters = {}) {
  const query = { 
    role: { $in: ['creator', 'both'] },
    profileCompleted: true 
  };
  
  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }
  
  if (filters.categories && filters.categories.length > 0) {
    query['creatorProfile.preferredCategories'] = { $in: filters.categories };
  }
  
  if (filters.minRating) {
    query['creatorProfile.averageRating'] = { $gte: filters.minRating };
  }
  
  if (filters.availability) {
    query['creatorProfile.availability'] = filters.availability;
  }
  
  if (filters.maxHourlyRate) {
    query['creatorProfile.hourlyRate'] = { $lte: filters.maxHourlyRate };
  }
  
  return this.find(query)
    .select('username name profileImage skills creatorProfile reputation')
    .sort({ 
      'creatorProfile.averageRating': -1, 
      'creatorProfile.completedBounties': -1 
    });
};

UserSchema.statics.getUserRank = async function(userId) {
  const user = await this.findById(userId);
  if (!user) return null;
  
  const rank = await this.countDocuments({
    role: { $in: ['creator', 'both'] },
    points: { $gt: user.points }
  });
  
  return rank + 1;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
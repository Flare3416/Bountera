import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  
  // Activity details
  activityType: {
    type: String,
    enum: [
      'daily_login',
      'profile_completion', 
      'bounty_applied',
      'bounty_completed',
      'donation_received',
      'donation_sent',
      'skill_added',
      'experience_added',
      'project_added',
      'achievement_unlocked'
    ],
    required: true
  },
  
  // Points and scoring
  pointsAwarded: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  
  // Related entities
  relatedBounty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bounty'
  },
  relatedDonation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Leaderboard and ranking schema
const leaderboardEntrySchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  profileImage: String,
  
  // Points and ranking
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  currentRank: {
    type: Number,
    min: 1
  },
  previousRank: Number,
  
  // Activity statistics
  stats: {
    dailyLogins: { type: Number, default: 0 },
    bountiesApplied: { type: Number, default: 0 },
    bountiesCompleted: { type: Number, default: 0 },
    donationsReceived: { type: Number, default: 0 },
    donationsSent: { type: Number, default: 0 },
    totalDonationAmount: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 },
    loginStreak: { type: Number, default: 0 },
    lastLoginDate: Date,
    profileCompletionPercentage: { type: Number, default: 0 }
  },
  
  // Achievements and badges
  achievements: [{
    type: {
      type: String,
      enum: [
        'first_login',
        'profile_completed',
        'first_application',
        'first_completion',
        'top_10_rank',
        'top_5_rank',
        'top_rank',
        'donation_giver',
        'donation_receiver',
        'consistent_user', // 7+ day login streak
        'power_user' // 30+ day login streak
      ]
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Time tracking
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  lastRankUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Migration tracking
  migratedFrom: {
    type: String,
    enum: ['localStorage', 'api'],
    default: 'api'
  }
}, {
  timestamps: true
});

// Indexes for leaderboard (userId already has unique index from schema)
leaderboardEntrySchema.index({ totalPoints: -1 });
leaderboardEntrySchema.index({ currentRank: 1 });
leaderboardEntrySchema.index({ username: 1 });
leaderboardEntrySchema.index({ lastActivityAt: -1 });

// Indexes for activities
activitySchema.index({ userId: 1 });
activitySchema.index({ activityType: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ pointsAwarded: -1 });

// Static methods for leaderboard
leaderboardEntrySchema.statics.updateUserPoints = async function(userId, pointsToAdd, activityType, description, metadata = {}) {
  try {
    // Find or create leaderboard entry
    let entry = await this.findOne({ userId });
    if (!entry) {
      const user = await mongoose.model('User').findById(userId);
      if (!user) throw new Error('User not found');
      
      entry = new this({
        userId,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage,
        totalPoints: 0
      });
    }
    
    // Update points
    entry.totalPoints += pointsToAdd;
    entry.lastActivityAt = new Date();
    
    // Update specific stats
    switch (activityType) {
      case 'daily_login':
        entry.stats.dailyLogins += 1;
        // Update login streak
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (entry.stats.lastLoginDate) {
          const lastLogin = new Date(entry.stats.lastLoginDate).toDateString();
          if (lastLogin === yesterday) {
            entry.stats.loginStreak += 1;
          } else if (lastLogin !== today) {
            entry.stats.loginStreak = 1;
          }
        } else {
          entry.stats.loginStreak = 1;
        }
        entry.stats.lastLoginDate = new Date();
        break;
        
      case 'bounty_applied':
        entry.stats.bountiesApplied += 1;
        break;
        
      case 'bounty_completed':
        entry.stats.bountiesCompleted += 1;
        break;
        
      case 'donation_received':
        entry.stats.donationsReceived += 1;
        if (metadata.amount) {
          entry.stats.totalDonationAmount += metadata.amount;
        }
        break;
        
      case 'donation_sent':
        entry.stats.donationsSent += 1;
        break;
    }
    
    await entry.save();
    
    // Create activity record
    await mongoose.model('Activity').create({
      userId,
      username: entry.username,
      activityType,
      pointsAwarded: pointsToAdd,
      description,
      metadata: metadata || {}
    });
    
    // Update rankings
    await this.updateRankings();
    
    return entry;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Update all user rankings
leaderboardEntrySchema.statics.updateRankings = async function() {
  try {
    const entries = await this.find({}).sort({ totalPoints: -1 });
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      entry.previousRank = entry.currentRank;
      entry.currentRank = i + 1;
      entry.lastRankUpdate = new Date();
      await entry.save();
    }
  } catch (error) {
    console.error('Error updating rankings:', error);
    throw error;
  }
};

// Get leaderboard
leaderboardEntrySchema.statics.getLeaderboard = async function(limit = 50) {
  return this.find({})
    .sort({ totalPoints: -1 })
    .limit(limit)
    .populate('userId', 'email role isVerified')
    .lean();
};

// Get user's rank and stats
leaderboardEntrySchema.statics.getUserRankAndStats = async function(userId) {
  const entry = await this.findOne({ userId }).lean();
  if (!entry) return null;
  
  const totalUsers = await this.countDocuments();
  const activities = await mongoose.model('Activity')
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
  return {
    ...entry,
    totalUsers,
    recentActivities: activities
  };
};

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
const LeaderboardEntry = mongoose.models.LeaderboardEntry || mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

export { Activity, LeaderboardEntry };
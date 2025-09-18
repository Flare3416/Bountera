import mongoose from 'mongoose';

const BountySchema = new mongoose.Schema({
  // Basic Bounty Information
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200 
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 5000 
  },
  
  // Requirements & Skills
  requirements: [{ 
    type: String,
    trim: true 
  }],
  skillsRequired: [{ 
    type: String,
    trim: true 
  }],
  difficultyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    required: true 
  },
  
  // Bounty Details
  category: { 
    type: String, 
    enum: [
      'Web Development', 
      'Mobile Development', 
      'UI/UX Design', 
      'Data Science', 
      'Blockchain', 
      'AI/ML', 
      'DevOps',
      'Testing',
      'Documentation',
      'Other'
    ], 
    default: 'Other', // Set default instead of required
    required: false // Made optional since we're using skillsRequired
  },
  
  // Reward Information
  rewardAmount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP'] 
  },
  
  // Timeline
  deadline: { 
    type: Date, 
    required: true 
  },
  estimatedDuration: { 
    type: String, // e.g., "2 weeks", "1 month"
    required: true 
  },
  
  // Status Management
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'review', 'completed', 'cancelled'], 
    default: 'open' 
  },
  
  // Bounty Poster Information
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // Assigned Creator (when bounty is taken)
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  
  // Application Management
  maxApplications: { 
    type: Number, 
    default: 10 
  },
  applicationCount: { 
    type: Number, 
    default: 0 
  },
  
  // Submission Details
  submissionGuidelines: { 
    type: String,
    maxlength: 2000 
  },
  submissionFormat: { 
    type: String,
    enum: ['GitHub Repository', 'Live Demo', 'Design Files', 'Document', 'Video', 'Other']
  },
  
  // Attachments & Resources
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String }
  }],
  referenceLinks: [{ 
    type: String 
  }],
  referenceImages: [{ 
    type: String // Base64 encoded images or URLs
  }],
  
  // Additional Information
  additionalInfo: {
    type: String,
    maxlength: 3000
  },
  contactInfo: {
    type: String,
    maxlength: 500
  },
  
  // Completion Details
  completedAt: { 
    type: Date 
  },
  submissionUrl: { 
    type: String 
  },
  feedback: { 
    type: String 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  
  // Visibility & Features
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  isPriority: { 
    type: Boolean, 
    default: false 
  },
  
  // Statistics
  viewCount: { 
    type: Number, 
    default: 0 
  },
  
  // Tags for better searchability
  tags: [{ 
    type: String,
    trim: true 
  }]
}, {
  timestamps: true,
  collection: 'bounties'
});

// Indexes for better performance
BountySchema.index({ postedBy: 1, status: 1 });
BountySchema.index({ category: 1, status: 1 });
BountySchema.index({ skillsRequired: 1 });
BountySchema.index({ deadline: 1 });
BountySchema.index({ rewardAmount: -1 });
BountySchema.index({ createdAt: -1 });
BountySchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search

// Virtual for time remaining
BountySchema.virtual('timeRemaining').get(function() {
  if (!this.deadline) return null;
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for status display
BountySchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'open': 'Open for Applications',
    'in_progress': 'In Progress',
    'review': 'Under Review',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Methods
BountySchema.methods.canApply = function() {
  return this.status === 'open' && 
         this.applicationCount < this.maxApplications && 
         new Date() < this.deadline;
};

BountySchema.methods.assignToBountyHunter = function(userId) {
  this.assignedTo = userId;
  this.status = 'in_progress';
  return this.save();
};

BountySchema.methods.markCompleted = function(submissionUrl, feedback, rating) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.submissionUrl = submissionUrl;
  this.feedback = feedback;
  this.rating = rating;
  return this.save();
};

BountySchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Static methods
BountySchema.statics.getActiveBounties = function(limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ 
    status: 'open',
    deadline: { $gt: new Date() }
  })
  .populate('postedBy', 'username name profileImage')
  .sort({ isFeatured: -1, isPriority: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

BountySchema.statics.getBountiesByCategory = function(category, limit = 20) {
  return this.find({ 
    category,
    status: 'open',
    deadline: { $gt: new Date() }
  })
  .populate('postedBy', 'username name profileImage')
  .sort({ createdAt: -1 })
  .limit(limit);
};

BountySchema.statics.getUserBounties = function(userId, status = null) {
  const query = { postedBy: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('postedBy', 'username name profileImage bountyPosterProfile')
    .populate('assignedTo', 'username name profileImage')
    .sort({ createdAt: -1 });
};

BountySchema.statics.getAssignedBounties = function(userId) {
  return this.find({ 
    assignedTo: userId,
    status: { $in: ['in_progress', 'review'] }
  })
  .populate('postedBy', 'username name profileImage')
  .sort({ deadline: 1 });
};

BountySchema.statics.searchBounties = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'open',
    deadline: { $gt: new Date() }
  };
  
  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.minReward) query.rewardAmount = { $gte: filters.minReward };
  if (filters.maxReward) {
    query.rewardAmount = { 
      ...query.rewardAmount, 
      $lte: filters.maxReward 
    };
  }
  if (filters.difficulty) query.difficultyLevel = filters.difficulty;
  if (filters.skills && filters.skills.length > 0) {
    query.skillsRequired = { $in: filters.skills };
  }
  
  return this.find(query)
    .populate('postedBy', 'username name profileImage')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
};

// Pre-save middleware
BountySchema.pre('save', function(next) {
  // Auto-generate tags from title and description
  if (this.isNew || this.isModified('title') || this.isModified('description')) {
    const text = `${this.title} ${this.description}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    this.tags = [...new Set(words)].slice(0, 10); // Unique words, max 10
  }
  next();
});

export default mongoose.models.Bounty || mongoose.model('Bounty', BountySchema);
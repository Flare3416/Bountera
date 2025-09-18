import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // Application Details
  bountyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bounty',
    required: true 
  },
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // Application Content
  proposal: { 
    type: String, 
    required: true,
    maxlength: 3000 
  },
  estimatedDeliveryTime: { 
    type: String, 
    required: true // e.g., "5 days", "2 weeks"
  },
  proposedApproach: { 
    type: String,
    maxlength: 2000 
  },
  
  // Portfolio & Experience
  relevantExperience: { 
    type: String,
    maxlength: 1500 
  },
  portfolioLinks: [{ 
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String }
  }],
  
  // Application Status
  status: { 
    type: String, 
    enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'submitted', 'completed'], 
    default: 'pending' 
  },
  
  // Work Submission Data (when status is 'submitted' or 'completed')
  submissionData: {
    message: { type: String },
    submittedAt: { type: Date },
    files: [{ 
      name: String,
      url: String,
      size: Number
    }]
  },
  
  // Communication
  coverLetter: { 
    type: String,
    maxlength: 1000 
  },
  questions: [{ 
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  
  // Timestamps for different stages
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  respondedAt: { 
    type: Date 
  },
  
  // Feedback from bounty poster
  feedback: { 
    type: String,
    maxlength: 1000 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  
  // Additional Information
  priceQuote: { 
    type: Number,
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  
  // Attachments (resume, samples, etc.)
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    fileSize: { type: Number }
  }],
  
  // Collaboration preferences
  communicationPreference: { 
    type: String, 
    enum: ['Email', 'Slack', 'Discord', 'WhatsApp', 'Telegram', 'Phone'], 
    default: 'Email' 
  },
  timezone: { 
    type: String 
  },
  availableHours: { 
    type: String // e.g., "9 AM - 6 PM IST"
  },
  
  // Application metadata
  source: { 
    type: String, 
    enum: ['direct_apply', 'invitation', 'referral'], 
    default: 'direct_apply' 
  },
  deviceInfo: { 
    type: String 
  },
  
  // Interview/Discussion
  interviewScheduled: { 
    type: Boolean, 
    default: false 
  },
  interviewDate: { 
    type: Date 
  },
  interviewNotes: { 
    type: String 
  }
}, {
  timestamps: true,
  collection: 'applications'
});

// Indexes for better performance
ApplicationSchema.index({ bountyId: 1, status: 1 });
ApplicationSchema.index({ applicantId: 1, status: 1 });
ApplicationSchema.index({ submittedAt: -1 });
ApplicationSchema.index({ bountyId: 1, applicantId: 1 }, { unique: true }); // One application per user per bounty

// Virtual for application age
ApplicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const submitted = new Date(this.submittedAt);
  const diffTime = now - submitted;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

// Virtual for status display
ApplicationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Under Review',
    'shortlisted': 'Shortlisted',
    'accepted': 'Accepted',
    'rejected': 'Not Selected',
    'withdrawn': 'Withdrawn'
  };
  return statusMap[this.status] || this.status;
});

// Methods
ApplicationSchema.methods.accept = async function() {
  this.status = 'accepted';
  this.respondedAt = new Date();
  
  // Update the bounty to assign this applicant
  const Bounty = mongoose.model('Bounty');
  await Bounty.findByIdAndUpdate(this.bountyId, {
    assignedTo: this.applicantId,
    status: 'in_progress'
  });
  
  // Reject other applications for the same bounty
  await mongoose.model('Application').updateMany(
    { 
      bountyId: this.bountyId, 
      _id: { $ne: this._id },
      status: { $in: ['pending', 'shortlisted'] }
    },
    { 
      status: 'rejected',
      respondedAt: new Date(),
      feedback: 'Another applicant was selected for this bounty.'
    }
  );
  
  return this.save();
};

ApplicationSchema.methods.reject = function(feedback = '') {
  this.status = 'rejected';
  this.respondedAt = new Date();
  this.feedback = feedback;
  return this.save();
};

ApplicationSchema.methods.shortlist = function() {
  this.status = 'shortlisted';
  this.reviewedAt = new Date();
  return this.save();
};

ApplicationSchema.methods.withdraw = function() {
  this.status = 'withdrawn';
  this.respondedAt = new Date();
  return this.save();
};

ApplicationSchema.methods.scheduleInterview = function(interviewDate, notes = '') {
  this.interviewScheduled = true;
  this.interviewDate = interviewDate;
  this.interviewNotes = notes;
  return this.save();
};

// Static methods
ApplicationSchema.statics.getBountyApplications = function(bountyId, status = null) {
  const query = { bountyId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('applicantId', 'username name profileImage skills experience')
    .sort({ submittedAt: -1 });
};

ApplicationSchema.statics.getUserApplications = function(userId, status = null) {
  const query = { applicantId: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('bountyId', 'title rewardAmount category status deadline')
    .sort({ submittedAt: -1 });
};

ApplicationSchema.statics.getPendingApplications = function(bountyPosterId) {
  return this.aggregate([
    {
      $lookup: {
        from: 'bounties',
        localField: 'bountyId',
        foreignField: '_id',
        as: 'bounty'
      }
    },
    {
      $unwind: '$bounty'
    },
    {
      $match: {
        'bounty.postedBy': bountyPosterId,
        status: 'pending'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'applicantId',
        foreignField: '_id',
        as: 'applicant'
      }
    },
    {
      $unwind: '$applicant'
    },
    {
      $sort: { submittedAt: -1 }
    }
  ]);
};

ApplicationSchema.statics.getApplicationStats = function(bountyId) {
  return this.aggregate([
    { $match: { bountyId: mongoose.Types.ObjectId(bountyId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

ApplicationSchema.statics.getTopApplicants = function(limit = 10) {
  return this.aggregate([
    {
      $match: { status: 'accepted' }
    },
    {
      $group: {
        _id: '$applicantId',
        acceptedApplications: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $sort: { acceptedApplications: -1, avgRating: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Pre-save middleware
ApplicationSchema.pre('save', function(next) {
  // Set reviewedAt when status changes from pending
  if (this.isModified('status') && 
      this.status !== 'pending' && 
      !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  
  // Set respondedAt for final statuses
  if (this.isModified('status') && 
      ['accepted', 'rejected'].includes(this.status) && 
      !this.respondedAt) {
    this.respondedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update bounty application count
ApplicationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Bounty = mongoose.model('Bounty');
    await Bounty.findByIdAndUpdate(doc.bountyId, {
      $inc: { applicationCount: 1 }
    });
  }
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
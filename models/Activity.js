import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'profile_update',
      'bounty_posted',
      'bounty_application',
      'bounty_completion',
      'daily_login',
      'donation_received',
      'profile_completion'
    ]
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
ActivitySchema.index({ email: 1, createdAt: -1 });
ActivitySchema.index({ activityType: 1, createdAt: -1 });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
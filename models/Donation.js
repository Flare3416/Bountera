import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  // Basic donation information
  donationId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Donor information
  fromUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: String
  },
  
  // Recipient information
  toUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: String
  },
  
  // Donation details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  message: {
    type: String,
    maxlength: 500
  },
  
  // Payment information
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentMethod: String,
    transactionId: String
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['general', 'tip', 'bounty_bonus', 'appreciation'],
    default: 'general'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Migration tracking
  migratedFrom: {
    type: String,
    enum: ['localStorage', 'api'],
    default: 'api'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
donationSchema.index({ 'fromUser.userId': 1 });
donationSchema.index({ 'toUser.userId': 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ donationId: 1 }, { unique: true });

// Virtual for total donations to a user
donationSchema.statics.getTotalDonationsForUser = async function(userId) {
  const result = await this.aggregate([
    { $match: { 'toUser.userId': userId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  return result[0] || { total: 0, count: 0 };
};

// Virtual for total donations from a user  
donationSchema.statics.getTotalDonationsFromUser = async function(userId) {
  const result = await this.aggregate([
    { $match: { 'fromUser.userId': userId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  return result[0] || { total: 0, count: 0 };
};

// Get recent donations for a user
donationSchema.statics.getRecentDonationsForUser = async function(userId, limit = 10) {
  return this.find({ 'toUser.userId': userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);

export default Donation;
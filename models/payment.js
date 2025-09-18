import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  // Donation Details
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  to_user: { 
    type: String, 
    required: true,
    trim: true 
  },
  message: { 
    type: String,
    maxlength: 500,
    trim: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01 
  },
  
  // Transaction Details
  oid: { 
    type: String, 
    required: true,
    unique: true 
  },
  razorpay_payment_id: { 
    type: String 
  },
  razorpay_order_id: { 
    type: String 
  },
  razorpay_signature: { 
    type: String 
  },
  
  // Payment Status
  done: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'], 
    default: 'pending' 
  },
  
  // User References
  from_user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  to_user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // Metadata
  currency: { 
    type: String, 
    default: 'INR' 
  },
  platform: { 
    type: String, 
    default: 'web' 
  },
  ip_address: { 
    type: String 
  },
  user_agent: { 
    type: String 
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes for better performance
PaymentSchema.index({ to_user: 1, createdAt: -1 }); // For recent donations
PaymentSchema.index({ oid: 1 }); // For payment verification
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ done: 1 });

// Static methods
PaymentSchema.statics.getRecentDonations = function(username, limit = 10) {
  return this.find({ 
    to_user: username, 
    done: true, 
    status: 'success' 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('name message amount createdAt');
};

PaymentSchema.statics.getTotalDonations = function(username) {
  return this.aggregate([
    { 
      $match: { 
        to_user: username, 
        done: true, 
        status: 'success' 
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      } 
    }
  ]);
};

PaymentSchema.statics.getDonationStats = function(username) {
  return this.aggregate([
    { 
      $match: { 
        to_user: username, 
        done: true, 
        status: 'success' 
      } 
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        avgDonation: { $avg: '$amount' },
        lastDonation: { $max: '$createdAt' }
      }
    }
  ]);
};

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
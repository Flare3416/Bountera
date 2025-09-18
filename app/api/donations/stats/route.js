import connectDB from '../../../../lib/mongodb.js';
import Donation from '../../../../models/Donation.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    // If userEmail is provided, return user-specific stats
    if (userEmail) {
      // Find the user by email to get their ID
      const User = (await import('../../../../models/User.js')).default;
      const user = await User.findOne({ email: userEmail });
      
      if (!user) {
        return NextResponse.json({
          success: true,
          data: {
            totalReceived: 0,
            totalDonated: 0,
            donationCount: 0
          }
        });
      }
      
      // Get user donation stats
      const received = await Donation.getTotalDonationsForUser(user._id);
      const donated = await Donation.getTotalDonationsFromUser(user._id);
      
      return NextResponse.json({
        success: true,
        data: {
          totalReceived: received.total,
          totalDonated: donated.total,
          donationCount: received.count + donated.count
        }
      });
    }
    
    // Return overall platform donation stats
    const totalStats = await Donation.aggregate([
      { 
        $match: { status: 'completed' } 
      },
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: '$amount' }, 
          totalDonations: { $sum: 1 } 
        } 
      }
    ]);
    
    // Count active campaigns (this would need to be defined based on your campaign model)
    // For now, I'll assume campaigns are donation recipients who have received donations recently
    const activeCampaigns = await Donation.distinct('toUser.userId', {
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const stats = totalStats[0] || { totalAmount: 0, totalDonations: 0 };
    
    return NextResponse.json({
      success: true,
      data: {
        totalDonations: stats.totalDonations,
        totalAmount: stats.totalAmount,
        activeCampaigns: activeCampaigns.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting donation stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get donation stats',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
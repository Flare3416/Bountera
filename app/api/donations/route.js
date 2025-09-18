import connectDB from '../../../lib/mongodb.js';
import Donation from '../../../models/Donation.js';
import User from '../../../models/User.js';
import { LeaderboardEntry } from '../../../models/Leaderboard.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const status = searchParams.get('status') || 'completed';
    
    let donations;
    
    switch (type) {
      case 'received':
        if (userId) {
          donations = await Donation.find({ 
            'toUser.userId': userId, 
            status 
          }).sort({ createdAt: -1 }).limit(limit);
        } else if (username) {
          donations = await Donation.find({ 
            'toUser.username': username, 
            status 
          }).sort({ createdAt: -1 }).limit(limit);
        } else {
          return NextResponse.json({ success: false, error: 'User ID or username required' }, { status: 400 });
        }
        break;
        
      case 'sent':
        if (userId) {
          donations = await Donation.find({ 
            'fromUser.userId': userId, 
            status 
          }).sort({ createdAt: -1 }).limit(limit);
        } else if (username) {
          donations = await Donation.find({ 
            'fromUser.username': username, 
            status 
          }).sort({ createdAt: -1 }).limit(limit);
        } else {
          return NextResponse.json({ success: false, error: 'User ID or username required' }, { status: 400 });
        }
        break;
        
      case 'recent':
        if (userId) {
          donations = await Donation.getRecentDonationsForUser(userId, limit);
        } else if (username) {
          const user = await User.findOne({ username });
          if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
          }
          donations = await Donation.getRecentDonationsForUser(user._id, limit);
        } else {
          donations = await Donation.find({ status })
            .sort({ createdAt: -1 })
            .limit(limit);
        }
        break;
        
      case 'stats':
        if (userId) {
          const received = await Donation.getTotalDonationsForUser(userId);
          const sent = await Donation.getTotalDonationsFromUser(userId);
          
          return NextResponse.json({
            success: true,
            data: {
              received,
              sent,
              totalReceived: received.total,
              totalSent: sent.total,
              donationsReceivedCount: received.count,
              donationsSentCount: sent.count
            }
          });
        } else {
          return NextResponse.json({ success: false, error: 'User ID required for stats' }, { status: 400 });
        }
        
      default:
        donations = await Donation.find({ status })
          .sort({ createdAt: -1 })
          .limit(limit);
    }
    
    return NextResponse.json({
      success: true,
      data: donations,
      count: donations.length
    });
    
  } catch (error) {
    console.error('Donations API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      fromUserId, 
      toUserId, 
      amount, 
      message, 
      paymentDetails,
      category = 'general'
    } = body;
    
    // Validate required fields
    if (!fromUserId || !toUserId || !amount) {
      return NextResponse.json(
        { success: false, error: 'fromUserId, toUserId, and amount are required' },
        { status: 400 }
      );
    }
    
    // Find users
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    
    if (!fromUser || !toUser) {
      return NextResponse.json(
        { success: false, error: 'One or both users not found' },
        { status: 404 }
      );
    }
    
    // Create donation
    const donation = new Donation({
      donationId: `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUser: {
        userId: fromUser._id,
        username: fromUser.username,
        name: fromUser.name,
        email: fromUser.email
      },
      toUser: {
        userId: toUser._id,
        username: toUser.username,
        name: toUser.name,
        email: toUser.email
      },
      amount,
      message: message || '',
      paymentDetails: paymentDetails || {},
      category,
      status: paymentDetails ? 'completed' : 'pending'
    });
    
    await donation.save();
    
    // Update leaderboard if completed
    if (donation.status === 'completed') {
      await LeaderboardEntry.updateUserPoints(
        toUser._id,
        Math.min(amount * 0.1, 50), // 10% of donation as points, max 50
        'donation_received',
        `Received donation of ₹${amount}`
      );
    }
    
    return NextResponse.json({
      success: true,
      data: donation,
      message: 'Donation created successfully'
    });
    
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { donationId, status, paymentDetails } = body;
    
    if (!donationId) {
      return NextResponse.json(
        { success: false, error: 'donationId is required' },
        { status: 400 }
      );
    }
    
    const donation = await Donation.findOne({ donationId });
    
    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    // Update donation
    if (status) donation.status = status;
    if (paymentDetails) donation.paymentDetails = { ...donation.paymentDetails, ...paymentDetails };
    if (status === 'completed' && !donation.completedAt) {
      donation.completedAt = new Date();
    }
    
    await donation.save();
    
    // Update leaderboard if just completed
    if (status === 'completed' && donation.status !== 'completed') {
      await LeaderboardEntry.updateUserPoints(
        donation.toUser.userId,
        Math.min(donation.amount * 0.1, 50),
        'donation_received',
        `Received donation of ₹${donation.amount}`
      );
    }
    
    return NextResponse.json({
      success: true,
      data: donation,
      message: 'Donation updated successfully'
    });
    
  } catch (error) {
    console.error('Update donation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
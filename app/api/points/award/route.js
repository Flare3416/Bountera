import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';
import { LeaderboardEntry } from '@/models/Leaderboard';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, points, type, description, bountyId } = await request.json();
    
    if (!email || !points || !type || !description) {
      return NextResponse.json(
        { error: 'Email, points, type, and description are required' }, 
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Update user points
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { points: points } },
      { new: true }
    );

    // Create activity record
    await Activity.create({
      userId: user._id,
      type,
      description,
      points,
      bountyId: bountyId || null
    });

    // Update leaderboard if user is a creator
    if (user.role === 'creator') {
      await LeaderboardEntry.findOneAndUpdate(
        { userId: user._id },
        { 
          $inc: { 
            totalPoints: points,
            ...(type === 'bounty_completion' && { bountyPoints: points, completedBounties: 1 })
          },
          lastUpdated: new Date()
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Points awarded successfully',
      points,
      totalPoints: updatedUser.points
    });

  } catch (error) {
    console.error('Award points error:', error);
    return NextResponse.json(
      { error: 'Failed to award points' }, 
      { status: 500 }
    );
  }
}
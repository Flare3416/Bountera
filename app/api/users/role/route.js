import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { LeaderboardEntry } from '@/models/Leaderboard';

export async function PUT(request) {
  try {
    await connectDB();
    
    const { email, role } = await request.json();
    
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['creator', 'bounty_poster'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Update user role
    const user = await User.findOneAndUpdate(
      { email },
      { 
        role,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user is a creator, add them to leaderboard
    if (role === 'creator') {
      try {
        // Check if already exists in leaderboard
        const existingEntry = await LeaderboardEntry.findOne({ userId: user._id });
        
        if (!existingEntry) {
          await LeaderboardEntry.create({
            userId: user._id,
            username: user.username,
            email,
            name: user.name,
            avatar: user.avatar || '',
            totalPoints: 0,
            bountyPoints: 0,
            activityPoints: 0,
            donationPoints: 0,
            completedBounties: 0,
            rank: 0,
            lastUpdated: new Date()
          });
        }
      } catch (leaderboardError) {
        console.error('Error adding user to leaderboard:', leaderboardError);
        // Don't fail the request if leaderboard update fails
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted
      }
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
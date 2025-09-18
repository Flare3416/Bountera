import connectDB from '../../../lib/mongodb.js';
import User from '../../../models/User.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Get creators from User collection directly
    const creators = await User.find({ 
      role: 'creator',
      username: { $exists: true, $ne: null } // Only users with usernames (completed profiles)
    })
    .select('name username email profileImage points backgroundImage skills bio socialLinks location')
    .sort({ points: -1 }) // Sort by points descending
    .limit(limit)
    .lean();
    
    // Add rank to each creator
    const creatorsWithRank = creators.map((creator, index) => ({
      ...creator,
      totalPoints: creator.points || 0,
      currentRank: index + 1,
      rank: index + 1
    }));
    
    return NextResponse.json({
      success: true,
      data: creatorsWithRank
    });
    
  } catch (error) {
    console.error('Leaderboard API error:', error);
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
    const { userId, updates } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const leaderboardEntry = await LeaderboardEntry.findOne({ userId });
    
    if (!leaderboardEntry) {
      return NextResponse.json(
        { success: false, error: 'Leaderboard entry not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key in leaderboardEntry.schema.paths) {
        leaderboardEntry[key] = updates[key];
      }
    });
    
    leaderboardEntry.lastActivityAt = new Date();
    await leaderboardEntry.save();
    
    return NextResponse.json({
      success: true,
      data: leaderboardEntry,
      message: 'Leaderboard entry updated successfully'
    });
    
  } catch (error) {
    console.error('Leaderboard PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
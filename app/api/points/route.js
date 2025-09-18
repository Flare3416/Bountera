import connectDB from '../../../lib/mongodb.js';
import User from '@/models/User';
import { awardDailyLoginPoints } from '../../../utils/pointsSystemMongoDB.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { action, userEmail } = body;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'userEmail is required' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'daily-login':
        // Initialize user in leaderboard if not exists
        await initializeUserInLeaderboard(userEmail);
        
        // Award daily login points
        result = await awardDailyLoginPoints(userEmail);
        
        if (result) {
          return NextResponse.json({
            success: true,
            message: 'Daily login points awarded',
            data: result
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Daily login points already awarded today or user not found'
          });
        }
        
      case 'get-points':
        // Find user directly from database
        const user = await User.findOne({ email: userEmail }).select('points');
        
        if (!user) {
          result = {
            points: 0,
            rank: 0,
            email: userEmail
          };
        } else {
          // Get rank by counting users with higher points
          const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;
          
          result = {
            points: user.points || 0,
            rank: rank || 0,
            email: userEmail
          };
        }
        
        return NextResponse.json({
          success: true,
          data: result
        });
        
      case 'initialize':
        result = await initializeUserInLeaderboard(userEmail);
        return NextResponse.json({
          success: true,
          message: 'User initialized in leaderboard',
          data: result
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Points API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || searchParams.get('userEmail');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      );
    }

    // Find user directly from database
    const user = await User.findOne({ email }).select('points');
    
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          points: 0,
          rank: 0,
          email
        }
      });
    }

    // Get rank by counting users with higher points
    const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;
    
    const result = {
      points: user.points || 0,
      rank: rank || 0,
      email
    };
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Points GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
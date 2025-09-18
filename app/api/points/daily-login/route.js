import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
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

    // Check if user has completed profile but has 0 points (existing user fix)
    // This should happen regardless of daily login status
    let bonusPoints = 0;
    if (user.role === 'creator' && user.username && user.points === 0) {
      bonusPoints = 10; // Award missing profile completion points
      console.log(`✅ Awarding retroactive profile completion points: ${bonusPoints}`);
    }

    // Check if user already claimed daily login today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingActivity = await Activity.findOne({
      email,
      activityType: 'daily_login',
      createdAt: { $gte: today }
    });

    if (existingActivity && bonusPoints === 0) {
      // Only return early if there are no bonus points to award
      return NextResponse.json({
        success: false,
        message: 'Daily login already claimed today',
        points: 0
      });
    }

    // Award daily login points (only if not already claimed)
    const dailyPoints = existingActivity ? 0 : 1;
    const totalPointsToAdd = dailyPoints + bonusPoints;
    
    // Only update points if there are points to add
    if (totalPointsToAdd > 0) {
      // Update user points (ensure points field exists)
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { 
          $inc: { points: totalPointsToAdd }
        },
        { new: true, upsert: false }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'Failed to update user points' }, 
          { status: 500 }
        );
      }

      console.log(`✅ Points awarded: ${dailyPoints} daily${bonusPoints > 0 ? ` + ${bonusPoints} retroactive profile points` : ''}, Total points: ${updatedUser.points}`);
    }

    // Create activity record only if daily login points were awarded
    if (dailyPoints > 0) {
      await Activity.create({
        email,
        activityType: 'daily_login',
        description: 'Daily login bonus'
      });
    }

    return NextResponse.json({
      success: true,
      message: bonusPoints > 0 
        ? (dailyPoints > 0 
          ? `Daily login bonus claimed! + ${bonusPoints} retroactive profile points awarded!`
          : `${bonusPoints} retroactive profile points awarded!`)
        : 'Daily login bonus claimed!',
      points: totalPointsToAdd,
      totalPoints: user.points + totalPointsToAdd
    });

  } catch (error) {
    console.error('Daily login error:', error);
    return NextResponse.json(
      { error: 'Failed to process daily login' }, 
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    // Remove Razorpay fields from existing bounty_poster users
    const result = await User.updateMany(
      { role: 'bounty_poster' },
      { 
        $unset: { 
          razorpayKeyId: "",
          razorpayKeySecret: ""
        }
      }
    );
    
    console.log(`✅ Cleaned ${result.modifiedCount} bounty poster users - removed unnecessary Razorpay fields`);
    
    return NextResponse.json({
      success: true,
      message: `Removed Razorpay fields from ${result.modifiedCount} bounty poster users`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error cleaning bounty poster data:', error);
    return NextResponse.json(
      { error: 'Failed to clean bounty poster data' }, 
      { status: 500 }
    );
  }
}
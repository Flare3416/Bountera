import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';

// Applications check endpoint
export async function GET(request) {
  try {
    console.log('🔍 Applications check endpoint called');
    
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const bountyId = searchParams.get('bountyId');

    console.log('📧 User email:', userEmail);
    console.log('🎯 Bounty ID:', bountyId);

    if (!userEmail || !bountyId) {
      console.log('❌ Missing parameters');
      return NextResponse.json(
        { success: false, error: 'Missing userEmail or bountyId parameter' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('✅ Database connected');

    // Find user by email to get their ID
    const user = await User.findOne({ email: userEmail }).select('_id');
    if (!user) {
      console.log('❌ User not found:', userEmail);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('👤 User found:', user._id);

    // Check if application exists
    const application = await Application.findOne({
      applicant: user._id,
      bounty: bountyId
    });

    console.log('📋 Application found:', !!application);

    return NextResponse.json({
      success: true,
      data: {
        hasApplied: !!application,
        applicationId: application?._id || null
      }
    });

  } catch (error) {
    console.error('❌ Error checking application:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
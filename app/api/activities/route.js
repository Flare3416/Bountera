import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    let query = {};
    if (email) {
      query.email = email;
    }
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      success: true,
      data: activities
    });
    
  } catch (error) {
    console.error('Error getting activities:', error);
    return NextResponse.json(
      { error: 'Failed to get activities' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, activityType, description, metadata } = await request.json();
    
    if (!email || !activityType) {
      return NextResponse.json(
        { error: 'Email and activity type are required' },
        { status: 400 }
      );
    }
    
    const activity = await Activity.create({
      email,
      activityType,
      description: description || '',
      metadata: metadata || {},
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      data: activity
    });
    
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
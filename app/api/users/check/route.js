import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    
    return NextResponse.json({
      success: true,
      exists: !!user,
      user: user ? {
        email: user.email,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted
      } : null
    });
  } catch (error) {
    console.error('❌ Error checking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const user = await User.findOne({ email });
    
    return NextResponse.json({
      success: true,
      exists: !!user,
      user: user ? {
        email: user.email,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted
      } : null
    });
  } catch (error) {
    console.error('❌ Error checking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
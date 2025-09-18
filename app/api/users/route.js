import connectDB from '../../../lib/mongodb.js';
import User from '../../../models/User.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const leaderboard = searchParams.get('leaderboard');
    
    if (leaderboard === 'true') {
      // Get leaderboard data
      const users = await User.getLeaderboard(parseInt(searchParams.get('limit')) || 10);
      return NextResponse.json({ success: true, data: users });
    }
    
    if (username) {
      // Get user by username
      const user = await User.findOne({ username }).select('-razorpayKeySecret');
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get user rank
      const rank = await User.getUserRank(user._id);
      const userWithRank = user.toObject();
      userWithRank.rank = rank;
      
      return NextResponse.json({ success: true, data: userWithRank });
    }
    
    if (email) {
      // Get user by email
      const user = await User.findOne({ email }).select('-razorpayKeySecret');
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: user });
    }
    
    // Get all users (with pagination)
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({})
      .select('-razorpayKeySecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('GET /api/users error:', error);
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
    console.log('📝 User creation request body:', JSON.stringify(body, null, 2));
    
    // Check if user already exists by email (username is optional for auth users)
    const existingUser = await User.findOne({ email: body.email });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Generate username from email if not provided
    if (!body.username) {
      body.username = body.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      // Ensure username uniqueness
      let baseUsername = body.username;
      let counter = 1;
      while (await User.findOne({ username: body.username })) {
        body.username = `${baseUsername}${counter}`;
        counter++;
      }
    } else {
      // Check username uniqueness if provided
      const userWithUsername = await User.findOne({ username: body.username });
      if (userWithUsername) {
        return NextResponse.json(
          { success: false, error: 'Username already exists' },
          { status: 409 }
        );
      }
    }
    
    console.log('✅ Generated username:', body.username);
    
    // Create new user data
    const userData = { ...body };
    
    // Only add Razorpay credentials for creators (who receive payments)
    if (body.role === 'creator' || body.role === 'both') {
      userData.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      userData.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    }
    
    const newUser = new User(userData);
    
    await newUser.save();
    
    // Return user without sensitive data
    const userResponse = newUser.toObject();
    delete userResponse.razorpayKeySecret;
    
    return NextResponse.json(
      { success: true, data: userResponse },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, email, ...updateData } = body;
    
    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required' },
        { status: 400 }
      );
    }
    
    // Don't allow updating sensitive fields directly
    delete updateData.razorpayKeySecret;
    delete updateData._id;
    delete updateData.createdAt;
    
    // Handle role changes - add/remove Razorpay credentials
    if (updateData.role) {
      if (updateData.role === 'creator' || updateData.role === 'both') {
        // Add Razorpay credentials for creators
        updateData.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        updateData.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      } else if (updateData.role === 'bounty_poster') {
        // Remove Razorpay credentials for bounty posters
        updateData.$unset = { razorpayKeyId: "", razorpayKeySecret: "" };
      }
    }
    
    // Find user by ID or email
    const query = userId ? { _id: userId } : { email: email };
    const updatedUser = await User.findOneAndUpdate(
      query,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-razorpayKeySecret');
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedUser });
    
  } catch (error) {
    console.error('PATCH /api/users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
    
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
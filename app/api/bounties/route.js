import connectDB from '../../../lib/mongodb.js';
import Bounty from '../../../models/Bounty.js';
import User from '../../../models/User.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const bountyId = searchParams.get('id');
    const postedBy = searchParams.get('postedBy');
    const assignedTo = searchParams.get('assignedTo');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    
    // Get single bounty by ID
    if (bountyId) {
      const bounty = await Bounty.findById(bountyId)
        .populate('postedBy', 'username name profileImage bountyPosterProfile')
        .populate('assignedTo', 'username name profileImage creatorProfile');
      
      if (!bounty) {
        return NextResponse.json(
          { success: false, error: 'Bounty not found' },
          { status: 404 }
        );
      }
      
      // Increment view count
      await bounty.incrementViews();
      
      return NextResponse.json({ success: true, data: bounty });
    }
    
    // Get bounties by poster (can be email or user ID)
    if (postedBy) {
      let userId = postedBy;
      
      // If postedBy contains @ symbol, it's an email - find user first
      if (postedBy.includes('@')) {
        const user = await User.findOne({ email: postedBy }).select('_id');
        if (!user) {
          return NextResponse.json({ 
            success: true, 
            data: [] // Return empty array if user not found
          });
        }
        userId = user._id;
      }
      
      const bounties = await Bounty.getUserBounties(userId, status);
      return NextResponse.json({ success: true, data: bounties });
    }
    
    // Get assigned bounties for a creator
    if (assignedTo) {
      const bounties = await Bounty.getAssignedBounties(assignedTo);
      return NextResponse.json({ success: true, data: bounties });
    }
    
    // Search bounties
    if (search) {
      const filters = {
        category: searchParams.get('filterCategory'),
        minReward: searchParams.get('minReward') ? parseFloat(searchParams.get('minReward')) : null,
        maxReward: searchParams.get('maxReward') ? parseFloat(searchParams.get('maxReward')) : null,
        difficulty: searchParams.get('difficulty'),
        skills: searchParams.get('skills') ? searchParams.get('skills').split(',') : []
      };
      
      // Remove null values
      Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === '' || 
            (Array.isArray(filters[key]) && filters[key].length === 0)) {
          delete filters[key];
        }
      });
      
      const bounties = await Bounty.searchBounties(search, filters);
      return NextResponse.json({ success: true, data: bounties });
    }
    
    // Get bounties by category
    if (category) {
      const limit = parseInt(searchParams.get('limit')) || 20;
      const bounties = await Bounty.getBountiesByCategory(category, limit);
      return NextResponse.json({ success: true, data: bounties });
    }
    
    // Get featured bounties
    if (featured === 'true') {
      const bounties = await Bounty.find({ 
        isFeatured: true,
        status: 'open',
        deadline: { $gt: new Date() }
      })
      .populate('postedBy', 'username name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);
      
      return NextResponse.json({ success: true, data: bounties });
    }
    
    // Get all active bounties with pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    const bounties = await Bounty.getActiveBounties(limit, page);
    
    const total = await Bounty.countDocuments({
      status: 'open',
      deadline: { $gt: new Date() }
    });
    
    return NextResponse.json({
      success: true,
      data: bounties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('GET /api/bounties error:', error);
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
    const { postedBy, ...bountyData } = body;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'rewardAmount', 'deadline', 'difficultyLevel'];
    for (const field of requiredFields) {
      if (!bountyData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate poster exists and has proper role
    const poster = await User.findById(postedBy);
    if (!poster) {
      return NextResponse.json(
        { success: false, error: 'Bounty poster not found' },
        { status: 404 }
      );
    }
    
    if (!['bounty_poster', 'both'].includes(poster.role)) {
      return NextResponse.json(
        { success: false, error: 'User is not authorized to post bounties' },
        { status: 403 }
      );
    }
    
    // Create new bounty
    const newBounty = new Bounty({
      ...bountyData,
      postedBy,
      deadline: new Date(bountyData.deadline)
    });
    
    await newBounty.save();
    
    // Update poster stats
    await poster.updatePosterStats('posted');
    
    // Populate poster info for response
    const populatedBounty = await Bounty.findById(newBounty._id)
      .populate('postedBy', 'username name profileImage');
    
    return NextResponse.json(
      { success: true, data: populatedBounty },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST /api/bounties error:', error);
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
    const { bountyId, action, userId, ...updateData } = body;
    
    if (!bountyId) {
      return NextResponse.json(
        { success: false, error: 'Bounty ID is required' },
        { status: 400 }
      );
    }
    
    const bounty = await Bounty.findById(bountyId);
    if (!bounty) {
      return NextResponse.json(
        { success: false, error: 'Bounty not found' },
        { status: 404 }
      );
    }
    
    // Handle specific actions
    if (action === 'assign') {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required for assignment' },
          { status: 400 }
        );
      }
      
      await bounty.assignToBountyHunter(userId);
      
      // Update creator stats
      const creator = await User.findById(userId);
      if (creator) {
        await creator.updateCreatorStats('won');
      }
      
    } else if (action === 'complete') {
      const { submissionUrl, feedback, rating } = updateData;
      await bounty.markCompleted(submissionUrl, feedback, rating);
      
      // Update both poster and creator stats
      const poster = await User.findById(bounty.postedBy);
      const creator = await User.findById(bounty.assignedTo);
      
      if (poster) {
        await poster.updatePosterStats('completed', bounty.rewardAmount);
      }
      
      if (creator) {
        await creator.updateCreatorStats('completed', bounty.rewardAmount);
      }
      
    } else if (action === 'cancel') {
      bounty.status = 'cancelled';
      await bounty.save();
      
      // Update poster stats
      const poster = await User.findById(bounty.postedBy);
      if (poster) {
        await poster.updatePosterStats('cancelled');
      }
      
    } else {
      // Regular update
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
          bounty[key] = updateData[key];
        }
      });
      
      await bounty.save();
    }
    
    // Return updated bounty
    const updatedBounty = await Bounty.findById(bountyId)
      .populate('postedBy', 'username name profileImage')
      .populate('assignedTo', 'username name profileImage');
    
    return NextResponse.json({ success: true, data: updatedBounty });
    
  } catch (error) {
    console.error('PATCH /api/bounties error:', error);
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
    const bountyId = searchParams.get('bountyId');
    const userId = searchParams.get('userId');
    
    if (!bountyId) {
      return NextResponse.json(
        { success: false, error: 'Bounty ID is required' },
        { status: 400 }
      );
    }
    
    const bounty = await Bounty.findById(bountyId);
    if (!bounty) {
      return NextResponse.json(
        { success: false, error: 'Bounty not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (userId && bounty.postedBy.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this bounty' },
        { status: 403 }
      );
    }
    
    // Only allow deletion if bounty is open or cancelled
    if (!['open', 'cancelled'].includes(bounty.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete bounty in current status' },
        { status: 400 }
      );
    }
    
    await Bounty.findByIdAndDelete(bountyId);
    
    // Also delete related applications
    const Application = (await import('../../../models/Application.js')).default;
    await Application.deleteMany({ bountyId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bounty deleted successfully' 
    });
    
  } catch (error) {
    console.error('DELETE /api/bounties error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
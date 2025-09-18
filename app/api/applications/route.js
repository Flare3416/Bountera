import connectDB from '../../../lib/mongodb.js';
import Application from '../../../models/Application.js';
import Bounty from '../../../models/Bounty.js';
import User from '../../../models/User.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');
    const bountyId = searchParams.get('bountyId');
    const applicantId = searchParams.get('applicantId');
    const posterId = searchParams.get('posterId');
    const status = searchParams.get('status');
    const stats = searchParams.get('stats');
    
    // Get single application by ID
    if (applicationId) {
      const application = await Application.findById(applicationId)
        .populate('bountyId', 'title rewardAmount category status deadline')
        .populate('applicantId', 'username name profileImage skills creatorProfile');
      
      if (!application) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: application });
    }
    
    // Get applications for a specific bounty
    if (bountyId) {
      const applications = await Application.getBountyApplications(bountyId, status);
      return NextResponse.json({ success: true, data: applications });
    }
    
    // Get applications by a specific user
    if (applicantId) {
      const applications = await Application.getUserApplications(applicantId, status);
      return NextResponse.json({ success: true, data: applications });
    }
    
    // Get pending applications for a bounty poster
    if (posterId) {
      const applications = await Application.getPendingApplications(posterId);
      return NextResponse.json({ success: true, data: applications });
    }
    
    // Get application statistics for a bounty
    if (stats === 'true' && bountyId) {
      const applicationStats = await Application.getApplicationStats(bountyId);
      const statsObject = applicationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});
      
      return NextResponse.json({ success: true, data: statsObject });
    }
    
    // Get all applications with pagination (admin view)
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('bountyId', 'title rewardAmount category status')
      .populate('applicantId', 'username name profileImage')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Application.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('GET /api/applications error:', error);
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
    const { bountyId, applicantId, ...applicationData } = body;
    
    // Validate required fields
    if (!bountyId || !applicantId || !applicationData.proposal || !applicationData.estimatedDeliveryTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if bounty exists and is open for applications
    const bounty = await Bounty.findById(bountyId);
    if (!bounty) {
      return NextResponse.json(
        { success: false, error: 'Bounty not found' },
        { status: 404 }
      );
    }
    
    if (!bounty.canApply()) {
      return NextResponse.json(
        { success: false, error: 'Bounty is not open for applications' },
        { status: 400 }
      );
    }
    
    // Check if user exists and is a creator
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return NextResponse.json(
        { success: false, error: 'Applicant not found' },
        { status: 404 }
      );
    }
    
    if (!['creator', 'both'].includes(applicant.role)) {
      return NextResponse.json(
        { success: false, error: 'User is not authorized to apply for bounties' },
        { status: 403 }
      );
    }
    
    // Check if user already applied for this bounty
    const existingApplication = await Application.findOne({ bountyId, applicantId });
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this bounty' },
        { status: 409 }
      );
    }
    
    // Create new application
    const newApplication = new Application({
      bountyId,
      applicantId,
      ...applicationData
    });
    
    await newApplication.save();
    
    // Update applicant stats
    await applicant.updateCreatorStats('applied');
    
    // Populate data for response
    const populatedApplication = await Application.findById(newApplication._id)
      .populate('bountyId', 'title rewardAmount category')
      .populate('applicantId', 'username name profileImage');
    
    return NextResponse.json(
      { success: true, data: populatedApplication },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST /api/applications error:', error);
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
    const { applicationId, action, ...updateData } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    const application = await Application.findById(applicationId)
      .populate('bountyId')
      .populate('applicantId', 'username name profileImage email');
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Handle specific actions
    if (action === 'accept') {
      await application.accept();
      
      // Award 5 points for quest acceptance
      if (application.applicantId?.email) {
        try {
          await User.findOneAndUpdate(
            { email: application.applicantId.email },
            { $inc: { points: 5 } }
          );
          console.log('✅ Acceptance points awarded to:', application.applicantId.email);
        } catch (error) {
          console.error('❌ Error awarding acceptance points:', error);
        }
      }
      
    } else if (action === 'reject') {
      const { feedback } = updateData;
      await application.reject(feedback);
      
    } else if (action === 'shortlist') {
      await application.shortlist();
      
    } else if (action === 'withdraw') {
      // Only applicant can withdraw
      await application.withdraw();
      
    } else if (action === 'schedule_interview') {
      const { interviewDate, notes } = updateData;
      await application.scheduleInterview(new Date(interviewDate), notes);
      
    } else {
      // Regular update
      const previousStatus = application.status;
      
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'submittedAt' && key !== 'createdAt') {
          application[key] = updateData[key];
        }
      });
      
      await application.save();
      
      // Award completion points if status changed to completed
      if (previousStatus !== 'completed' && application.status === 'completed' && application.applicantId?.email) {
        try {
          // Award 100 completion points
          await User.findOneAndUpdate(
            { email: application.applicantId.email },
            { $inc: { points: 100 } }
          );
          console.log('✅ Completion points awarded to:', application.applicantId.email);
        } catch (error) {
          console.error('❌ Error awarding completion points:', error);
        }
      }
    }
    
    // Return updated application
    const updatedApplication = await Application.findById(applicationId)
      .populate('bountyId', 'title rewardAmount category status')
      .populate('applicantId', 'username name profileImage');
    
    return NextResponse.json({ success: true, data: updatedApplication });
    
  } catch (error) {
    console.error('PATCH /api/applications error:', error);
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
    const applicationId = searchParams.get('applicationId');
    const userId = searchParams.get('userId');
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership (only applicant can delete their application)
    if (userId && application.applicantId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this application' },
        { status: 403 }
      );
    }
    
    // Only allow deletion if application is pending or withdrawn
    if (!['pending', 'withdrawn'].includes(application.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete application in current status' },
        { status: 400 }
      );
    }
    
    await Application.findByIdAndDelete(applicationId);
    
    // Update bounty application count
    await Bounty.findByIdAndUpdate(application.bountyId, {
      $inc: { applicationCount: -1 }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application deleted successfully' 
    });
    
  } catch (error) {
    console.error('DELETE /api/applications error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
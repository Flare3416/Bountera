import connectDB from '../../../../lib/mongodb.js';
import Application from '../../../../models/Application.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const { applicationId, submissionData } = await request.json();
    
    if (!applicationId || !submissionData) {
      return NextResponse.json(
        { success: false, error: 'Application ID and submission data are required' },
        { status: 400 }
      );
    }
    
    // Find the application
    const application = await Application.findById(applicationId)
      .populate('bountyId', 'title postedBy')
      .populate('applicantId', 'username email');
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if application is in accepted status
    if (application.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Only accepted applications can submit work' },
        { status: 400 }
      );
    }
    
    // Update application with submission data
    application.status = 'submitted'; // This will need to be added to the model enum
    application.submissionData = {
      message: submissionData.message,
      submittedAt: submissionData.submittedAt || new Date(),
      files: submissionData.files || []
    };
    application.updatedAt = new Date();
    
    await application.save();
    
    console.log(`✅ Work submitted for application ${applicationId}`);
    
    return NextResponse.json({ 
      success: true, 
      data: application,
      message: 'Work submitted successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error submitting work:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit work',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
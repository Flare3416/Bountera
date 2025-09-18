import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Bounty from '@/models/Bounty';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updateData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Bounty ID is required' }, 
        { status: 400 }
      );
    }

    // Update the bounty
    const updatedBounty = await Bounty.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!updatedBounty) {
      return NextResponse.json(
        { error: 'Bounty not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBounty);

  } catch (error) {
    console.error('Update bounty error:', error);
    return NextResponse.json(
      { error: 'Failed to update bounty' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Bounty ID is required' }, 
        { status: 400 }
      );
    }

    // Delete the bounty
    const deletedBounty = await Bounty.findByIdAndDelete(id);

    if (!deletedBounty) {
      return NextResponse.json(
        { error: 'Bounty not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bounty deleted successfully' 
    });

  } catch (error) {
    console.error('Delete bounty error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bounty' }, 
      { status: 500 }
    );
  }
}
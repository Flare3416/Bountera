import connectDB from '../../../../lib/mongodb.js';
import Bounty from '../../../../models/Bounty.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    // Find all bounties that are expired but still marked as 'open'
    const now = new Date();
    const expiredBounties = await Bounty.find({
      status: 'open',
      deadline: { $lt: now }
    });
    
    if (expiredBounties.length === 0) {
      return NextResponse.json({ 
        success: true, 
        count: 0,
        message: 'No expired bounties found' 
      });
    }
    
    // Update all expired bounties to 'cancelled' status
    const updateResult = await Bounty.updateMany(
      {
        status: 'open',
        deadline: { $lt: now }
      },
      {
        $set: { 
          status: 'cancelled',
          updatedAt: now
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} expired bounties to cancelled status`);
    
    return NextResponse.json({ 
      success: true, 
      count: updateResult.modifiedCount,
      message: `Updated ${updateResult.modifiedCount} expired bounties to cancelled status`
    });
    
  } catch (error) {
    console.error('❌ Error updating expired bounties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update expired bounties',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
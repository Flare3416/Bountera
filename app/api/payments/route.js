import connectDB from '../../../lib/mongodb.js';
import Payment from '../../../models/payment.js';
import User from '../../../models/User.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const userId = searchParams.get('userId');
    const recent = searchParams.get('recent');
    const stats = searchParams.get('stats');
    
    if (recent === 'true' && username) {
      // Get recent donations for a user
      const limit = parseInt(searchParams.get('limit')) || 10;
      const donations = await Payment.getRecentDonations(username, limit);
      return NextResponse.json({ success: true, data: donations });
    }
    
    if (stats === 'true' && username) {
      // Get donation statistics for a user
      const donationStats = await Payment.getDonationStats(username);
      const stats = donationStats[0] || {
        totalAmount: 0,
        totalDonations: 0,
        avgDonation: 0,
        lastDonation: null
      };
      return NextResponse.json({ success: true, data: stats });
    }
    
    if (username) {
      // Get all donations for a user
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 20;
      const skip = (page - 1) * limit;
      
      const donations = await Payment.find({ 
        to_user: username,
        done: true,
        status: 'success' 
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      const total = await Payment.countDocuments({ 
        to_user: username,
        done: true,
        status: 'success' 
      });
      
      return NextResponse.json({
        success: true,
        data: donations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    // Get all payments (admin view)
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    const payments = await Payment.find({})
      .populate('to_user_id', 'username name profileImage')
      .populate('from_user_id', 'username name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Payment.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('GET /api/payments error:', error);
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
    const { to_user, name, message, amount, oid } = body;
    
    // Validate required fields
    if (!to_user || !name || !amount || !oid) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the recipient user
    const toUser = await User.findOne({ username: to_user });
    if (!toUser) {
      return NextResponse.json(
        { success: false, error: 'Recipient user not found' },
        { status: 404 }
      );
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ oid });
    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment with this order ID already exists' },
        { status: 409 }
      );
    }
    
    // Create new payment
    const newPayment = new Payment({
      name,
      to_user,
      message,
      amount: parseFloat(amount),
      oid,
      to_user_id: toUser._id,
      status: 'pending',
      done: false,
      currency: body.currency || 'INR',
      platform: body.platform || 'web',
      ip_address: body.ip_address,
      user_agent: body.user_agent
    });
    
    await newPayment.save();
    
    return NextResponse.json(
      { success: true, data: newPayment },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST /api/payments error:', error);
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
    const { paymentId, oid, status, razorpay_payment_id, razorpay_signature } = body;
    
    let payment;
    
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    } else if (oid) {
      payment = await Payment.findOne({ oid });
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment ID or Order ID is required' },
        { status: 400 }
      );
    }
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Update payment details
    if (status) payment.status = status;
    if (razorpay_payment_id) payment.razorpay_payment_id = razorpay_payment_id;
    if (razorpay_signature) payment.razorpay_signature = razorpay_signature;
    
    // Mark as done if status is success
    if (status === 'success') {
      payment.done = true;
      
      // Update user donation stats
      const toUser = await User.findById(payment.to_user_id);
      if (toUser) {
        await toUser.incrementDonationStats(payment.amount);
      }
    }
    
    await payment.save();
    
    return NextResponse.json({ success: true, data: payment });
    
  } catch (error) {
    console.error('PATCH /api/payments error:', error);
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
    const paymentId = searchParams.get('paymentId');
    const oid = searchParams.get('oid');
    
    let payment;
    
    if (paymentId) {
      payment = await Payment.findByIdAndDelete(paymentId);
    } else if (oid) {
      payment = await Payment.findOneAndDelete({ oid });
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment ID or Order ID is required' },
        { status: 400 }
      );
    }
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment deleted successfully' 
    });
    
  } catch (error) {
    console.error('DELETE /api/payments error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
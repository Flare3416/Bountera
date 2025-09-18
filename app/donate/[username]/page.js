'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// import { getUserByUsername } from '@/utils/userDataMongoDB';
import { saveDonation } from '@/utils/donationDataMongoDB';
import DashboardNavbar from '@/components/DashboardNavbar';
import Navbar from '@/components/Navbar';

const DonatePage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const username = params.username;
  
  const [creator, setCreator] = useState(null);
  const [formData, setFormData] = useState({
    donorName: '',
    message: '',
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (username) {
      // Fetch user data by username from API
      fetch(`/api/users?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setCreator(data.data);
          else setCreator(null);
        })
        .catch(() => setCreator(null));
    }
  }, [username]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.email) {
      alert('You must be logged in to make a donation.');
      return;
    }

    if (!formData.donorName.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    setIsSubmitting(true);

    // Fetch donor and creator ObjectIds
    let donorId = null;
    let creatorId = null;
    try {
      // Get donor ObjectId
      const donorRes = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
      const donorData = await donorRes.json();
      donorId = donorData?.data?._id;
      // Get creator ObjectId
      if (creator?.username) {
        const creatorRes = await fetch(`/api/users?username=${encodeURIComponent(creator.username)}`);
        const creatorData = await creatorRes.json();
        creatorId = creatorData?.data?._id;
      }
    } catch (err) {
      donorId = null;
      creatorId = null;
    }

    if (!donorId || !creatorId) {
      alert('Unable to process donation: donor or creator account not found. Please ensure you are logged in and the creator exists.');
      setIsSubmitting(false);
      return;
    }

    setTimeout(async () => {
      const donation = {
        fromUserId: donorId,
        toUserId: creatorId,
        donorName: formData.donorName.trim(),
        message: formData.message.trim() || 'Thank you for your work!',
        amount: parseFloat(formData.amount)
      };

      const savedDonation = await saveDonation(donation);

      if (savedDonation) {
        setShowSuccess(true);
        setFormData({ donorName: '', message: '', amount: '' });
      } else {
        alert('There was an error processing your donation. Please try again.');
      }

      setIsSubmitting(false);
    }, 2000);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        {/* Navbar */}
        {session ? <DashboardNavbar /> : <Navbar />}
        
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h1 className="text-2xl font-bold text-yellow-800 mb-2">Creator Not Found</h1>
            <p className="text-yellow-600">The creator you&apos;re looking for doesn&apos;t exist.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        {/* Navbar */}
        {session ? <DashboardNavbar /> : <Navbar />}
        
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="max-w-md mx-auto p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200">
            <div className="text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-yellow-800 mb-4">Amazing!</h1>
              <p className="text-yellow-700 mb-6">
                Your support for <span className="font-semibold">{creator.username}</span> has been sent successfully! You&apos;re helping make their creative journey possible. 🌟
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push(`/profile/${username}`)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-500 transition-all duration-300"
                >
                  View Creator Profile
                </button>
                <button 
                  onClick={handleBackToDashboard}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl font-semibold hover:from-yellow-700 hover:to-yellow-600 transition-all duration-300"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      {/* Navbar - Show appropriate navbar based on login status */}
      {session ? <DashboardNavbar /> : <Navbar />}
      
      <div className="container mx-auto px-6 py-12 pt-24">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="mb-4">
            <span className="text-6xl">💝</span>
          </div>
          <h1 className="text-4xl font-bold text-yellow-800 mb-4">
            Support {creator.username}
          </h1>
          <p className="text-yellow-600 text-lg">
            Your support means the world to creators! Every contribution helps them continue creating amazing work.
          </p>
        </div>

        {/* Creator Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-yellow-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg">
                  {creator.profileImage ? (
                    <img
                      src={creator.profileImage}
                      alt={`${creator.username}&apos;s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-2xl font-bold ${creator.profileImage ? 'hidden' : 'flex'}`}
                >
                  {creator.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-yellow-800">{creator.username}</h2>
                <p className="text-yellow-600">{creator.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 mb-6 text-center">Make a Donation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="donorName" className="block text-sm font-semibold text-yellow-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="donorName"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/70 text-yellow-800 placeholder-yellow-400"
                  placeholder="Your name (how you'd like to be recognized)"
                  required
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-yellow-700 mb-2">
                  Message of Support (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/70 text-yellow-800 placeholder-yellow-400 resize-none"
                  placeholder="Share an encouraging message! 'Keep up the amazing work!' or 'Love your creativity!' 💝"
                />
              </div>

              {/* Amount Field */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-yellow-700 mb-2">
                  Support Amount (₹) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/70 text-yellow-800 placeholder-yellow-400"
                  placeholder="Every contribution matters! 💰"
                  required
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {[50, 100, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                    className="py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-yellow-300 text-yellow-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white hover:from-yellow-600 hover:to-yellow-500 hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Support...</span>
                  </div>
                ) : (
                  '🎁 Send Support Now'
                )}
              </button>
            </form>

            {/* Back Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.back()}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                ← Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
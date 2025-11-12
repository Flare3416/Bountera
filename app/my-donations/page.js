'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BountyHunterNavbar from '@/components/BountyHunterNavbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserRole } from '@/utils/userData';
import { getDonationsForUser, getTotalDonationsReceived } from '@/utils/donationData';

const MyDonationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole(session);
    if (userRole !== 'creator') {
      router.push('/dashboard');
      return;
    }

    // Load donations
    const userDonations = getDonationsForUser(session.user.email);
    const total = getTotalDonationsReceived(session.user.email);
    
    // Sort by date (newest first)
    const sortedDonations = userDonations.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    setDonations(sortedDonations);
    setTotalAmount(total);
    setLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <SakuraPetals />
        <div className="text-center relative z-10">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-4xl mb-4">💝</div>
            <h1 className="text-2xl font-bold text-pink-700 mb-2">Loading Donations...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 relative overflow-hidden">
      <BountyHunterNavbar />
      <SakuraPetals />

      <div className="relative z-20 p-6 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-pink-700 mb-2 flex items-center">
              <span className="text-4xl mr-3">💝</span>
              My Donations
            </h1>
            <p className="text-pink-600">All the support you've received from generous donors</p>
          </div>

          {/* Total Donations Card */}
          <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-300 shadow-2xl border-2 border-yellow-400/50 floating-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-semibold mb-2">Total Donations Received</p>
                <h2 className="text-5xl font-bold text-white drop-shadow-lg">${totalAmount.toFixed(2)}</h2>
              </div>
              <div className="text-7xl">🎉</div>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-400/30">
              <p className="text-yellow-800 font-medium">
                {donations.length} {donations.length === 1 ? 'donation' : 'donations'} from amazing supporters
              </p>
            </div>
          </div>

          {/* Donations List */}
          {donations.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card text-center">
              <div className="text-6xl mb-4">💝</div>
              <h2 className="text-2xl font-bold text-pink-700 mb-2">No Donations Yet</h2>
              <p className="text-pink-600 mb-6">
                When people support your work, their donations will appear here!
              </p>
              <button
                onClick={() => router.push('/profile-setup')}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Complete Your Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 hover:shadow-2xl transition-all duration-300 floating-card"
                >
                  {/* Donation Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center text-2xl shadow-lg">
                        💰
                      </div>
                      <div>
                        <h3 className="font-bold text-pink-700 text-lg">{donation.from}</h3>
                        <p className="text-pink-500 text-sm">
                          {new Date(donation.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">${donation.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Donation Message */}
                  {donation.message && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-yellow-50 border border-pink-100">
                      <p className="text-sm font-semibold text-pink-600 mb-1 flex items-center">
                        <span className="mr-2">💬</span>
                        Message:
                      </p>
                      <p className="text-pink-700 italic">"{donation.message}"</p>
                    </div>
                  )}

                  {/* Thank You Badge */}
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-500 text-sm font-medium">
                        {donation.fromEmail === 'anonymous' ? 'Anonymous Donor' : 'Registered Donor'}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-xs rounded-full font-semibold">
                        ❤️ Supporter
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Stats */}
          {donations.length > 0 && (
            <div className="mt-8 p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-pink-600 font-semibold mb-1">Average Donation</p>
                  <p className="text-2xl font-bold text-pink-700">
                    ${(totalAmount / donations.length).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-pink-600 font-semibold mb-1">Largest Donation</p>
                  <p className="text-2xl font-bold text-pink-700">
                    ${Math.max(...donations.map(d => d.amount)).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💌</div>
                  <p className="text-pink-600 font-semibold mb-1">With Messages</p>
                  <p className="text-2xl font-bold text-pink-700">
                    {donations.filter(d => d.message).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDonationsPage;

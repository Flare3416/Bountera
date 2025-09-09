'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';

const Leaderboard = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 relative overflow-hidden">
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Sakura Petals Background */}
      <SakuraPetals />

      {/* Main Content */}
      <div className="relative z-10 pt-20 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-4">
              🏆 Leaderboard
            </h1>
            <p className="text-pink-600 text-xl">See where you rank among the top creators in our community</p>
          </div>

          {/* Coming Soon Card */}
          <div className="max-w-4xl mx-auto">
            <div className="p-12 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card text-center">
              <div className="text-8xl mb-6">🏅</div>
              <h2 className="text-3xl font-bold text-pink-700 mb-4">Leaderboard Coming Soon!</h2>
              <p className="text-pink-600 text-lg mb-8">
                Track your progress and compete with creators worldwide. See rankings based on completed bounties, community contributions, and skill ratings.
              </p>
              
              {/* Preview Rankings */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🥇</div>
                      <div className="text-left">
                        <p className="font-bold text-yellow-800">Top Creator</p>
                        <p className="text-yellow-600 text-sm">Coming Soon</p>
                      </div>
                    </div>
                    <div className="text-yellow-700 font-bold">🌟 999 pts</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🥈</div>
                      <div className="text-left">
                        <p className="font-bold text-gray-800">Second Place</p>
                        <p className="text-gray-600 text-sm">Coming Soon</p>
                      </div>
                    </div>
                    <div className="text-gray-700 font-bold">🌟 888 pts</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🥉</div>
                      <div className="text-left">
                        <p className="font-bold text-orange-800">Third Place</p>
                        <p className="text-orange-600 text-sm">Coming Soon</p>
                      </div>
                    </div>
                    <div className="text-orange-700 font-bold">🌟 777 pts</div>
                  </div>
                </div>
              </div>
              
              <p className="text-pink-500">Start completing bounties to claim your spot!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

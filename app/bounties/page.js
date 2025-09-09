'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';

const Bounties = () => {
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
              🎯 Bounties
            </h1>
            <p className="text-pink-600 text-xl">Discover exciting challenges and earn rewards for your skills</p>
          </div>

          {/* Coming Soon Card */}
          <div className="max-w-4xl mx-auto">
            <div className="p-12 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card text-center">
              <div className="text-8xl mb-6">🚧</div>
              <h2 className="text-3xl font-bold text-pink-700 mb-4">Coming Soon!</h2>
              <p className="text-pink-600 text-lg mb-8">
                We're working hard to bring you amazing bounties where you can showcase your talents and earn rewards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-pink-50 border border-pink-200">
                  <div className="text-4xl mb-3">💻</div>
                  <h3 className="font-bold text-pink-700 mb-2">Development</h3>
                  <p className="text-pink-600 text-sm">Web development, mobile apps, and software projects</p>
                </div>
                <div className="p-6 rounded-2xl bg-pink-50 border border-pink-200">
                  <div className="text-4xl mb-3">🎨</div>
                  <h3 className="font-bold text-pink-700 mb-2">Design</h3>
                  <p className="text-pink-600 text-sm">UI/UX design, graphics, and visual content creation</p>
                </div>
                <div className="p-6 rounded-2xl bg-pink-50 border border-pink-200">
                  <div className="text-4xl mb-3">✍️</div>
                  <h3 className="font-bold text-pink-700 mb-2">Content</h3>
                  <p className="text-pink-600 text-sm">Writing, marketing, and content strategy projects</p>
                </div>
              </div>
              <p className="text-pink-500">Stay tuned for updates!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bounties;

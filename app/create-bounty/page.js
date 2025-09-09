'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserRole } from '@/utils/userData';

const CreateBounty = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if not bounty poster
  React.useEffect(() => {
    if (session && getUserRole(session) !== 'bounty_poster') {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Sakura Petals Background */}
      <SakuraPetals />

      {/* Main Content */}
      <div className="relative z-10 pt-20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-4">
              🎯 Set Up Bounty
            </h1>
            <p className="text-purple-600 text-xl">Create exciting projects and find talented creators</p>
          </div>

          {/* Coming Soon Card */}
          <div className="p-12 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card text-center">
            <div className="text-8xl mb-6">🚧</div>
            <h2 className="text-3xl font-bold text-purple-700 mb-4">Bounty Creation Coming Soon!</h2>
            <p className="text-purple-600 text-lg mb-8">
              We're working hard to bring you an amazing bounty creation experience where you can post projects and find the perfect creators for your needs.
            </p>
            
            {/* Preview Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-purple-700 mb-2">Project Details</h3>
                <p className="text-purple-600 text-sm">Describe your project requirements, timeline, and budget</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-bold text-purple-700 mb-2">Skills & Categories</h3>
                <p className="text-purple-600 text-sm">Select the skills and categories that match your project</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-purple-700 mb-2">Budget & Payment</h3>
                <p className="text-purple-600 text-sm">Set your budget and choose payment milestones</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold text-purple-700 mb-2">Creator Matching</h3>
                <p className="text-purple-600 text-sm">Get matched with qualified creators for your project</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/bounty-dashboard')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={() => router.push('/find-creators')}
                className="px-8 py-3 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300"
              >
                Browse Creators
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBounty;

'use client';
import React from 'react';

const RoleSelectionModal = ({ isOpen, onRoleSelect, onClose }) => {
  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    onRoleSelect(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100/50 p-8 max-w-2xl w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌸</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-4">
            Welcome to Bountera!
          </h2>
          <p className="text-pink-600 text-lg">
            Choose how you'd like to join our community
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Creator Card */}
          <div 
            onClick={() => handleRoleSelect('creator')}
            className="group p-6 rounded-2xl border-2 border-pink-200 hover:border-pink-400 bg-gradient-to-br from-pink-50 to-pink-100/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="text-xl font-bold text-pink-700 mb-3">Join as Creator</h3>
              <p className="text-pink-600 text-sm mb-4">
                Showcase your talents, complete bounties, and build your portfolio
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-2 text-sm text-pink-600">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Create stunning portfolios</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-pink-600">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Complete bounties and earn</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-pink-600">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Compete on leaderboards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bounty Poster Card */}
          <div 
            onClick={() => handleRoleSelect('bounty_poster')}
            className="group p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💼</div>
              <h3 className="text-xl font-bold text-purple-700 mb-3">Join as Bounty Poster</h3>
              <p className="text-purple-600 text-sm mb-4">
                Post projects, find talented creators, and get your work done
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Post bounties and projects</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Find skilled creators</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Manage your projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't worry, you can always change this later in your settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;

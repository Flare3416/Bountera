"use client";

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 text-gray-700 py-16 border-t border-pink-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="text-3xl">🌸</div>
              <div className="text-2xl font-black bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                Bountera
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The ultimate platform for creators to showcase their skills, compete for bounties, 
              and build their personal brand in the gamified future of talent discovery.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors text-2xl">📧</a>
              <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors text-2xl">🐦</a>
              <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors text-2xl">💼</a>
              <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors text-2xl">📸</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-pink-600">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-600 hover:text-pink-600 transition-colors">Features</a></li>
              <li><a href="#creators" className="text-gray-600 hover:text-pink-600 transition-colors">Top Creators</a></li>
              <li><a href="#bounties" className="text-gray-600 hover:text-pink-600 transition-colors">Browse Bounties</a></li>
              <li><a href="#leaderboard" className="text-gray-600 hover:text-pink-600 transition-colors">Leaderboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-pink-600">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pink-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 mb-4 md:mb-0">
            © 2025 Bountera. All rights reserved.
          </div>
          <div className="text-gray-500 text-sm">
            Made with 💖 for creators worldwide
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

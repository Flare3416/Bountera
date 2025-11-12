'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUserDisplayName, getUserProfileImage, getUserData } from '@/utils/userData';

const BountyPosterNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleProfileAction = (action) => {
    setShowProfileDropdown(false);
    if (action === 'view-profile') {
      const userData = getUserData(session?.user?.email);
      if (userData && userData.username) {
        router.push(`/profile/${userData.username}`);
      } else {
        router.push('/bounty-poster-setup');
      }
    } else if (action === 'edit-profile') {
      router.push('/bounty-poster-setup');
    } else if (action === 'logout') {
      signOut({ callbackUrl: '/' });
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100/50 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => handleNavigation('/bounty-dashboard')}
        >
          <div className="text-3xl">💼</div>
          <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Bountera
          </div>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-8 text-lg">
          <button
            onClick={() => handleNavigation('/bounty-dashboard')}
            className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group"
          >
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 group-hover:w-full transition-all duration-300"></span>
          </button>

          <button
            onClick={() => handleNavigation('/create-bounty')}
            className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group"
          >
            Post Bounty
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 group-hover:w-full transition-all duration-300"></span>
          </button>
          
          <button
            onClick={() => handleNavigation('/my-bounties')}
            className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group"
          >
            My Bounties
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 group-hover:w-full transition-all duration-300"></span>
          </button>
          
          <button
            onClick={() => handleNavigation('/applicants')}
            className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group"
          >
            Applications
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 group-hover:w-full transition-all duration-300"></span>
          </button>
          
          <button
            onClick={() => handleNavigation('/leaderboard')}
            className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group"
          >
            Find Creators
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-purple-50 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-full border-3 border-purple-300 bg-gradient-to-br from-purple-100 to-purple-200 group-hover:border-purple-400 overflow-hidden flex items-center justify-center transition-all duration-300">
              {getUserProfileImage(session) ? (
                <Image
                  src={getUserProfileImage(session)}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-purple-600 font-bold">
                  {getUserDisplayName(session)?.[0]?.toUpperCase() || '💼'}
                </div>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-purple-600 transition-transform duration-300 ${
                showProfileDropdown ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-1/2 translate-x-1/2 mt-2 w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100/50 py-2 animate-fade-in">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden flex items-center justify-center">
                    {getUserProfileImage(session) ? (
                      <Image
                        src={getUserProfileImage(session)}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-purple-600 font-bold text-lg">
                        {getUserDisplayName(session)?.[0]?.toUpperCase() || '💼'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{getUserDisplayName(session)}</p>
                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => handleProfileAction('edit-profile')}
                  className="w-full px-4 py-3 text-left transition-all duration-300 flex items-center space-x-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <div className="border-t my-2 border-purple-100"></div>
                
                <button
                  onClick={() => handleProfileAction('logout')}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 transition-all duration-300 flex items-center space-x-3 text-gray-700 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="p-2 rounded-lg hover:bg-purple-50 transition-all duration-300">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BountyPosterNavbar;

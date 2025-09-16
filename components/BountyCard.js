'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCategoryById, getDifficultyById, formatCurrency, getBountyExpirationInfo, getTimeRemainingDisplay, normalizeBountyCategories } from '@/utils/bountyData';
import { getUserDisplayNameByEmail, getUserProfileImageByEmail } from '@/utils/userData';
import { getApplicationCountForBounty } from '@/utils/applicationData';

const BountyCard = ({ bounty, isOwner = false, onEdit, onDelete, onApply, onViewDetails, onUpdateStatus, userRole = null }) => {
  // Determine theme colors based on user role
  const isPoster = userRole === 'bounty_poster';
  const themeColors = isPoster ? {
    primary: 'purple',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-400',
    hoverFrom: 'hover:from-purple-600',
    hoverTo: 'hover:to-purple-500',
    bg50: 'bg-purple-50',
    bg100: 'bg-purple-100',
    bg200: 'bg-purple-200',
    text: 'text-purple-600',
    border: 'border-purple-100',
    ring: 'ring-purple-200',
    creatorBg: 'bg-purple-500'
  } : {
    primary: 'pink',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-400',
    hoverFrom: 'hover:from-pink-600',
    hoverTo: 'hover:to-rose-500',
    bg50: 'bg-pink-50',
    bg100: 'bg-pink-100',
    bg200: 'bg-pink-200',
    text: 'text-pink-600',
    border: 'border-pink-100',
    ring: 'ring-pink-200',
    creatorBg: 'bg-pink-500'
  };

  // State for real-time updates
  const [currentTime, setCurrentTime] = useState(new Date());
  const [applicantCount, setApplicantCount] = useState(0);

  // Update time every minute for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Get applicant count when component mounts
  useEffect(() => {
    if (bounty?.id) {
      const count = getApplicationCountForBounty(bounty.id);
      setApplicantCount(count);
    }
  }, [bounty?.id]);

  // Listen for localStorage changes to update applicant count in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      if (bounty?.id) {
        const count = getApplicationCountForBounty(bounty.id);
        setApplicantCount(count);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    window.addEventListener('applicationsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('applicationsUpdated', handleStorageChange);
    };
  }, [bounty?.id]);

  // Handle both old single category format and new multiple categories format
  const categories = normalizeBountyCategories(bounty);
  const primaryCategory = categories.length > 0 ? getCategoryById(categories[0]) : null;
  const difficulty = getDifficultyById(bounty.difficulty);

  // Use centralized expiration logic
  const { isExpired } = getBountyExpirationInfo(bounty.deadline);

  // Get status display text and color - prioritize expiration check
  const getStatusInfo = () => {
    // ALWAYS show expired if deadline has passed
    if (isExpired) {
      return { text: 'EXPIRED', color: 'bg-red-100 text-red-700 border-red-200' };
    }

    // Only use stored status if not expired
    switch (bounty.status) {
      case 'open':
        return { text: 'OPEN', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'in-progress':
        return { text: 'IN PROGRESS', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'in_progress': // Also support underscore version for backward compatibility
        return { text: 'IN PROGRESS', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'completed':
        return { text: 'COMPLETED', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'cancelled':
        return { text: 'CANCELLED', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'expired':
        return { text: 'EXPIRED', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { text: 'OPEN', color: 'bg-blue-100 text-blue-700 border-blue-200' }; // Default to OPEN instead of UNKNOWN
    }
  };

  const statusInfo = getStatusInfo();

  // Use centralized time remaining display
  const timeInfo = getTimeRemainingDisplay(bounty.deadline);

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-400',
      green: 'from-green-500 to-green-400',
      pink: 'from-pink-500 to-pink-400',
      purple: 'from-purple-500 to-purple-400',
      orange: 'from-orange-500 to-orange-400',
      red: 'from-red-500 to-red-400',
      indigo: 'from-indigo-500 to-indigo-400',
      yellow: 'from-yellow-500 to-yellow-400',
      teal: 'from-teal-500 to-teal-400',
      gray: 'from-gray-500 to-gray-400'
    };
    return colors[color] || colors.gray;
  };

  const getDifficultyColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-700 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      red: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[color] || colors.green;
  };

  return (
    <div 
      className={`p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border ${themeColors.border}/50 floating-card transition-all duration-300 hover:shadow-2xl hover:scale-105 ${isExpired || bounty.status === 'cancelled' ? 'opacity-70' : ''} ${onViewDetails ? 'cursor-pointer' : ''}`}
      onClick={onViewDetails ? () => onViewDetails(bounty) : undefined}
    >
      
      {/* User Profile Section - Top */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {getUserProfileImageByEmail(bounty.creator) ? (
              <div className={`relative w-10 h-10 rounded-full overflow-hidden ring-2 ${themeColors.ring} shadow-sm`}>
                <Image
                  src={getUserProfileImageByEmail(bounty.creator)}
                  alt={getUserDisplayNameByEmail(bounty.creator)}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${themeColors.gradientFrom} ${themeColors.gradientTo} flex items-center justify-center text-white font-bold text-sm ring-2 ${themeColors.ring} shadow-sm`}>
                {getUserDisplayNameByEmail(bounty.creator).charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-800">
                {getUserDisplayNameByEmail(bounty.creator)}
              </span>
              <span className={`px-2 py-0.5 ${themeColors.creatorBg} text-white text-xs font-medium rounded-full`}>
                Creator
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(bounty.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons - Fixed position */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          {isOwner ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onEdit === 'function') {
                    onEdit(bounty.id);
                  }
                }}
                className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-200 hover:scale-105"
                title="Edit Bounty"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onDelete === 'function') {
                    onDelete(bounty.id);
                  }
                }}
                className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:scale-105"
                title="Delete Bounty"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              {/* Status Update Buttons */}
              {onUpdateStatus && typeof onUpdateStatus === 'function' && (
                <>
                  {bounty.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(bounty.id, 'completed');
                      }}
                      className="p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-200 hover:scale-105"
                      title="Mark as Completed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                  
                  {bounty.status !== 'cancelled' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(bounty.id, 'cancelled');
                      }}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 hover:scale-105"
                      title="Mark as Cancelled"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            !isExpired && onApply && typeof onApply === 'function' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(bounty);
                }}
                className={`px-6 py-2 rounded-full bg-gradient-to-r ${themeColors.gradientFrom} ${themeColors.gradientTo} text-white font-medium ${themeColors.hoverFrom} ${themeColors.hoverTo} transition-all duration-300 hover:scale-105 shadow-lg`}
              >
                Apply
              </button>
            )
          )}
        </div>
      </div>

      {/* Title and Badges Section */}
      <div className="mb-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${primaryCategory ? getCategoryColor(primaryCategory.color) : getCategoryColor('gray')} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {primaryCategory ? primaryCategory.icon : '⭐'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{bounty.title}</h3>
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty.color)}`}>
                {difficulty.name}
              </span>
              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Flexible */}
      <div className="flex-1 flex flex-col">
        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-shrink-0">{bounty.description}</p>

        {/* Categories - Smart single line display */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            {/* Always show first category */}
            {(() => {
              const cat = getCategoryById(categories[0]);
              return cat ? (
                <span
                  className={`px-3 py-1 rounded-full ${themeColors.bg100} ${themeColors.text} text-xs font-medium flex items-center space-x-1 whitespace-nowrap`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              ) : null;
            })()}
            
            {/* Show second category only if it has a short name */}
            {categories.length === 2 && (() => {
              const cat = getCategoryById(categories[1]);
              return cat && cat.name.length <= 15 ? (
                <span
                  className={`px-3 py-1 rounded-full ${themeColors.bg100} ${themeColors.text} text-xs font-medium flex items-center space-x-1 whitespace-nowrap`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 whitespace-nowrap">
                  +1
                </span>
              );
            })()}
            
            {/* For 3+ categories, always show +X */}
            {categories.length > 2 && (
              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 whitespace-nowrap">
                +{categories.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Contact Information */}
        {bounty.contact && (
          <div className={`mb-4 p-3 ${themeColors.bg50} rounded-xl border ${themeColors.border} flex-shrink-0`}>
            <div className="flex items-center space-x-2 mb-1">
              <span className={themeColors.text}>📞</span>
              <span className="text-sm font-medium text-gray-700">Contact:</span>
            </div>
            <p className="text-sm text-gray-600 break-words">{bounty.contact}</p>
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Footer - Always at bottom */}
        <div className={`flex items-center justify-between pt-4 border-t ${themeColors.border} flex-shrink-0`}>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${themeColors.text}`}>{formatCurrency(bounty.budget)}</div>
              <div className="text-xs text-gray-500">Budget</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${timeInfo.color}`}>
                {timeInfo.display}
              </div>
              <div className="text-xs text-gray-500">
                {timeInfo.label}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">{primaryCategory ? primaryCategory.name : 'No category'}</div>
            <div className="text-xs text-gray-500">
              {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyCard;

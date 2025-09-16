'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { X, Clock, DollarSign, User, Calendar, MapPin, FileText, Image as ImageIcon, Briefcase, Star } from 'lucide-react';
import { getCategoryById, getDifficultyById, formatCurrency, getBountyExpirationInfo, getTimeRemainingDisplay } from '@/utils/bountyData';
import { getUserDisplayNameByEmail, getUserProfileImageByEmail, getUserRole } from '@/utils/userData';
import { applyToBounty, hasUserApplied } from '@/utils/applicationData';
import { awardApplicationPoints } from '@/utils/pointsSystem';

const BountyModal = ({ bounty, isOpen, onClose, onApply, userRole = null }) => {
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  
  // Check if user has already applied when modal opens
  useEffect(() => {
    if (session?.user?.email && bounty?.id) {
      setHasApplied(hasUserApplied(bounty.id, session.user.email));
    }
  }, [session, bounty, isOpen]);
  
  if (!isOpen || !bounty) return null;

  // Determine theme colors based on user role
  const isPoster = userRole === 'bounty_poster';
  const themeColors = isPoster ? {
    primary: 'purple',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-400',
    bg50: 'bg-purple-50',
    bg100: 'bg-purple-100',
    text: 'text-purple-600',
    textLight: 'text-purple-500',
    border: 'border-purple-200',
    ring: 'ring-purple-200'
  } : {
    primary: 'pink',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-pink-400',
    bg50: 'bg-pink-50',
    bg100: 'bg-pink-100',
    text: 'text-pink-600',
    textLight: 'text-pink-500',
    border: 'border-pink-200',
    ring: 'ring-pink-200'
  };

  const { isExpired, timeRemaining } = getBountyExpirationInfo(bounty.deadline);
  const categories = Array.isArray(bounty.categories) ? bounty.categories : (bounty.category ? [bounty.category] : []);
  const difficulty = getDifficultyById(bounty.difficulty);
  const timeDisplay = getTimeRemainingDisplay(bounty.deadline);
  
  // Handle different bounty creator field names
  const bountyCreator = bounty.creator || bounty.createdBy || bounty.poster || bounty.posterEmail || 'unknown@example.com';
  
  // Handle reference images
  const referenceImages = bounty.referenceImages || [];
  const hasImages = referenceImages.length > 0;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % referenceImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + referenceImages.length) % referenceImages.length);
  };

  const handleApply = async () => {
    if (!session?.user?.email || applying || hasApplied) return;
    
    setApplying(true);
    try {
      // Get user data for application
      const userDataKey = `user_${session.user.email}`;
      const userData = localStorage.getItem(userDataKey);
      const parsedUserData = userData ? JSON.parse(userData) : {};
      
      const applicationData = {
        email: session.user.email,
        name: parsedUserData.name || session.user.name || 'Unknown',
        username: parsedUserData.username || 'unknown',
        image: parsedUserData.profileImage || session.user.image,
        message: `I would like to work on this bounty: ${bounty.title}`,
        skills: parsedUserData.skills || []
      };

      const success = applyToBounty(bounty.id, applicationData);
      
      if (success) {
        setHasApplied(true);
        
        // Award points for application (only for creators)
        const userRole = getUserRole(session);
        if (userRole === 'creator') {
          awardApplicationPoints(session.user.email, bounty.id, bounty.title);
        }
        
        // Show success message
        alert('Application submitted successfully! The bounty poster will review your application.');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error applying to bounty:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {getUserProfileImageByEmail(bountyCreator) ? (
                  <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-3 ${themeColors.ring} shadow-lg`}>
                    <Image
                      src={getUserProfileImageByEmail(bountyCreator)}
                      alt="Creator"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-full ${themeColors.bg100} flex items-center justify-center ring-3 ${themeColors.ring} shadow-lg`}>
                    <User className={`w-6 h-6 ${themeColors.text}`} />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getUserDisplayNameByEmail(bountyCreator) || 'Anonymous Poster'}
                </h3>
                <p className={`text-sm ${themeColors.textLight}`}>Bounty Poster</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{bounty.title}</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isExpired 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {isExpired ? 'EXPIRED' : bounty.status?.toUpperCase() || 'OPEN'}
              </div>
            </div>
            
            {/* Categories and Difficulty */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((categoryId, index) => {
                const category = getCategoryById(categoryId);
                return category ? (
                  <span
                    key={index}
                    className={`px-3 py-1 ${themeColors.bg50} ${themeColors.text} rounded-full text-sm font-medium border ${themeColors.border}`}
                  >
                    {category.icon} {category.name}
                  </span>
                ) : null;
              })}
              {difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  difficulty.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                  difficulty.color === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {difficulty.name}
                </span>
              )}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 ${themeColors.bg50} rounded-xl border ${themeColors.border}`}>
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className={`w-5 h-5 ${themeColors.text}`} />
                <span className="font-medium text-gray-700">Budget</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(bounty.budget)}</p>
            </div>
            
            <div className={`p-4 ${themeColors.bg50} rounded-xl border ${themeColors.border}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className={`w-5 h-5 ${themeColors.text}`} />
                <span className="font-medium text-gray-700">Deadline</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(bounty.deadline).toLocaleDateString()}
              </p>
              {!isExpired && (
                <p className={`text-sm ${timeDisplay.color} mt-1`}>
                  {timeDisplay.display} - {timeDisplay.label}
                </p>
              )}
            </div>
            
            <div className={`p-4 ${themeColors.bg50} rounded-xl border ${themeColors.border}`}>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className={`w-5 h-5 ${themeColors.text}`} />
                <span className="font-medium text-gray-700">Contact</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{bounty.contact || 'Via platform'}</p>
            </div>
          </div>

          {/* Reference Images */}
          {hasImages && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ImageIcon className={`w-5 h-5 ${themeColors.text}`} />
                <h3 className="text-lg font-semibold text-gray-900">Reference Images</h3>
              </div>
              <div className="relative">
                <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={typeof referenceImages[currentImageIndex] === 'object' ? 
                      referenceImages[currentImageIndex].file : 
                      referenceImages[currentImageIndex]}
                    alt={`Reference ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
                {referenceImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {referenceImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {referenceImages.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {referenceImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? themeColors.border : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={typeof image === 'object' ? image.file : image}
                        alt={`Thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className={`w-5 h-5 ${themeColors.text}`} />
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {bounty.description}
              </p>
            </div>
          </div>

          {/* Deliverables */}
          {bounty.deliverables && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className={`w-5 h-5 ${themeColors.text}`} />
                <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {bounty.deliverables}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {bounty.additionalInfo && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Star className={`w-5 h-5 ${themeColors.text}`} />
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {bounty.additionalInfo}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Apply Button */}
        {!isExpired && userRole === 'creator' && bounty.status !== 'in-progress' && bounty.status !== 'completed' && bounty.status !== 'cancelled' && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-6 rounded-b-3xl">
            <button
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={`w-full py-4 px-6 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                hasApplied 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : applying 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : `bg-gradient-to-r ${themeColors.gradientFrom} ${themeColors.gradientTo} text-white hover:shadow-lg transform hover:scale-105`
              }`}
            >
              <span>
                {hasApplied ? 'Application Submitted' : applying ? 'Submitting...' : 'Apply for This Bounty'}
              </span>
              {!hasApplied && !applying && <Star className="w-5 h-5" />}
              {hasApplied && <span className="w-5 h-5">✓</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BountyModal;
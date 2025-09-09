'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { saveUserData, getAllUserData } from '@/utils/userData';
import PurplePetals from '@/components/PurplePetals';

const BountyPosterProfileSetup = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const profileImageRef = useRef(null);
  const bannerImageRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    bio: '',
    profileImage: '',
    bannerImage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState({
    profile: false,
    banner: false
  });
  const [previewImages, setPreviewImages] = useState({
    profile: null,
    banner: null
  });

  // Auto-save debounce timer
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saving' | 'saved' | ''

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Handle page visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save immediately when tab becomes hidden
        saveDraft(formData);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [formData]);

  // Auto-save every 30 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.user?.email && (formData.name || formData.bio || formData.companyName)) {
        saveDraft(formData);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [formData, session]);

  // Auto-save draft key
  const getDraftKey = () => session?.user?.email ? `draft_bounty_profile_${session.user.email}` : null;

  // Save form data as draft
  const saveDraft = (data) => {
    const draftKey = getDraftKey();
    if (draftKey && typeof window !== 'undefined') {
      try {
        setAutoSaveStatus('saving');
        localStorage.setItem(draftKey, JSON.stringify(data));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 2000); // Clear status after 2 seconds
      } catch (error) {
        console.warn('Failed to save draft:', error);
        setAutoSaveStatus('');
      }
    }
  };

  // Load draft data
  const loadDraft = () => {
    const draftKey = getDraftKey();
    if (draftKey && typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem(draftKey);
        return draft ? JSON.parse(draft) : null;
      } catch (error) {
        console.warn('Failed to load draft:', error);
        return null;
      }
    }
    return null;
  };

  // Clear draft after successful submission
  const clearDraft = () => {
    const draftKey = getDraftKey();
    if (draftKey && typeof window !== 'undefined') {
      localStorage.removeItem(draftKey);
    }
  };

  // Load existing data
  useEffect(() => {
    if (session?.user?.email) {
      // First, try to load saved profile data
      const existingData = getAllUserData(session);
      
      // Then, check for draft data (takes priority)
      const draftData = loadDraft();
      
      const dataToLoad = draftData || existingData;
      
      if (dataToLoad) {
        setFormData({
          name: dataToLoad.name || session.user.name || '',
          companyName: dataToLoad.companyName || '',
          bio: dataToLoad.bio || '',
          profileImage: dataToLoad.profileImage || '',
          bannerImage: dataToLoad.bannerImage || ''
        });
        
        if (dataToLoad.profileImage) {
          setPreviewImages(prev => ({ ...prev, profile: dataToLoad.profileImage }));
        }
        if (dataToLoad.bannerImage) {
          setPreviewImages(prev => ({ ...prev, banner: dataToLoad.bannerImage }));
        }
      } else if (session.user.name) {
        setFormData(prev => ({ ...prev, name: session.user.name }));
      }
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Auto-save with debounce
    const timer = setTimeout(() => {
      saveDraft(updatedData);
    }, 1000); // Save after 1 second of no typing
    
    setAutoSaveTimer(timer);
  };

  const handleImageUpload = async (file, type) => {
    return new Promise((resolve, reject) => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please choose a file smaller than 5MB.');
        reject(new Error('File too large'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set maximum dimensions
          const maxWidth = type === 'banner' ? 1200 : 400;
          const maxHeight = type === 'banner' ? 400 : 400;
          
          let { width, height } = img;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          
          const updatedData = { ...formData, [`${type}Image`]: compressedBase64 };
          setFormData(updatedData);
          setPreviewImages(prev => ({ ...prev, [type]: compressedBase64 }));
          
          // Save draft with new image
          saveDraft(updatedData);
          
          resolve();
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageProcessing(prev => ({ ...prev, profile: true }));
      try {
        await handleImageUpload(file, 'profile');
      } catch (error) {
        console.error('Error reading profile image:', error);
        alert('Failed to process profile image. Please try a smaller file.');
      } finally {
        setImageProcessing(prev => ({ ...prev, profile: false }));
      }
    }
  };

  const handleBannerImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageProcessing(prev => ({ ...prev, banner: true }));
      try {
        await handleImageUpload(file, 'banner');
      } catch (error) {
        console.error('Error reading banner image:', error);
        alert('Failed to process banner image. Please try a smaller file.');
      } finally {
        setImageProcessing(prev => ({ ...prev, banner: false }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      console.error('No user email found');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save bounty poster data with error handling for storage quota
      try {
        const updatedData = saveUserData(session.user.email, {
          ...formData,
          role: 'bounty_poster',
          profileCompleted: true,
          lastUpdated: new Date().toISOString()
        });
        
        // Clear draft on successful save
        clearDraft();
        
        // Redirect to bounty dashboard
        router.push('/bounty-dashboard');
      } catch (storageError) {
        console.error('Storage error:', storageError);
        
        // If storage quota exceeded, try saving without images
        if (storageError.name === 'QuotaExceededError' || storageError.message.includes('quota')) {
          const dataWithoutImages = {
            ...formData,
            profileImage: '',
            bannerImage: '',
            role: 'bounty_poster',
            profileCompleted: true,
            lastUpdated: new Date().toISOString()
          };
          
          try {
            saveUserData(session.user.email, dataWithoutImages);
            alert('Profile saved successfully, but images were too large to store. You can re-upload smaller images later.');
            
            // Clear draft on successful save
            clearDraft();
            
            router.push('/bounty-dashboard');
          } catch (secondError) {
            console.error('Second storage attempt failed:', secondError);
            alert('Failed to save profile due to storage limitations. Please try with smaller images or contact support.');
          }
        } else {
          throw storageError; // Re-throw if it's not a quota error
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <PurplePetals />
        <div className="text-center relative z-10">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
            <div className="text-4xl mb-4">💼</div>
            <h1 className="text-2xl font-bold text-purple-700 mb-2">Loading...</h1>
            <p className="text-purple-600">Setting up your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Purple Petals Background */}
      <PurplePetals />

      {/* Main Content */}
      <div className="relative z-10 pt-8 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💼</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-4">
              Set Up Your Business Profile
            </h1>
            <p className="text-purple-600 text-lg">
              Complete your profile to start posting bounties and finding talented creators
            </p>
            
            {/* Auto-save Status */}
            {autoSaveStatus && (
              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  autoSaveStatus === 'saving' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving draft...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Draft saved
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image Section */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Profile Image</h3>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-purple-300 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4 cursor-pointer hover:border-purple-400 transition-all duration-300">
                  {previewImages.profile ? (
                    <img
                      src={previewImages.profile}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-purple-600 text-4xl">💼</div>
                  )}
                </div>
                <input
                  type="file"
                  ref={profileImageRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => profileImageRef.current?.click()}
                  disabled={imageProcessing.profile}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageProcessing.profile ? 'Processing...' : 'Upload Profile Image'}
                </button>
              </div>
            </div>

            {/* Banner Image Section */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Banner Image</h3>
              <div className="w-full h-48 rounded-2xl border-4 border-dashed border-purple-300 overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-4 cursor-pointer hover:border-purple-400 transition-all duration-300">
                {previewImages.banner ? (
                  <img
                    src={previewImages.banner}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-purple-400 text-4xl mb-2">🖼️</div>
                    <p className="text-purple-600">Click to upload banner</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={bannerImageRef}
                onChange={handleBannerImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bannerImageRef.current?.click()}
                disabled={imageProcessing.banner}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {imageProcessing.banner ? 'Processing...' : 'Upload Banner Image'}
              </button>
            </div>

            {/* Basic Info */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card-purple space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-purple-700 font-semibold mb-2">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 bg-white/70"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-700 font-semibold mb-2">Company/Organization Name (Optional)</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company or organization name"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 bg-white/70"
                />
              </div>

              <div>
                <label className="block text-purple-700 font-semibold mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell creators about yourself and what kinds of projects you're looking for..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 resize-none bg-white/70"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xl font-bold rounded-2xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Profile Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BountyPosterProfileSetup;

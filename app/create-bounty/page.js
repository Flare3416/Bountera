'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import PurplePetals from '@/components/PurplePetals';
import { getUserRole } from '@/utils/userData';
import { saveBounty, getBountyById, updateBounty, BOUNTY_CATEGORIES, DIFFICULTY_LEVELS, isBountyOwner } from '@/utils/bountyData';
import { logActivity, ACTIVITY_TYPES } from '@/utils/activityData';
import { forceCleanupIfNeeded, isStorageHigh, getStorageInfo } from '@/utils/storageManager';



const CreateBountyContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const editBountyId = searchParams.get('edit');
  const isEditMode = !!editBountyId;

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [],
    difficulty: '',
    budget: '',
    deadline: '',
    contact: '',
    deliverables: '',
    additionalInfo: '',
    referenceImages: []
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);

  // Update storage info when component mounts
  useEffect(() => {
    const updateStorageInfo = () => {
      try {
        const info = getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Error getting storage info:', error);
      }
    };

    updateStorageInfo();
    // Update every 10 seconds
    const interval = setInterval(updateStorageInfo, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole(session);
    if (userRole !== 'bounty_poster') {
      router.push('/dashboard');
      return;
    }

    // Load existing bounty data if in edit mode
    if (isEditMode && editBountyId && initialLoad) {
      const existingBounty = getBountyById(editBountyId);
      if (existingBounty) {
        // Check if the current user is the creator of this bounty
        if (isBountyOwner(existingBounty, session.user.email)) {
          setFormData({
            title: existingBounty.title || '',
            description: existingBounty.description || '',
            categories: existingBounty.categories || [],
            difficulty: existingBounty.difficulty || '',
            budget: existingBounty.budget || '',
            deadline: existingBounty.deadline || '',
            contact: existingBounty.contact || '',
            deliverables: existingBounty.deliverables || '',
            additionalInfo: existingBounty.additionalInfo || '',
            referenceImages: existingBounty.referenceImages || []
          });
          setImagePreview(existingBounty.referenceImages || []);
        } else {
          alert('You can only edit your own bounties');
          router.push('/bounties');
          return;
        }
      } else {
        alert('Bounty not found');
        router.push('/bounties');
        return;
      }
      setInitialLoad(false);
    }
  }, [session, status, router, isEditMode, editBountyId, initialLoad]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const categories = prev.categories || [];
      if (categories.includes(categoryId)) {
        return {
          ...prev,
          categories: categories.filter(cat => cat !== categoryId)
        };
      } else if (categories.length < 3) {
        return {
          ...prev,
          categories: [...categories, categoryId]
        };
      }
      return prev;
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.referenceImages.length + files.length > 3) {
      alert('You can upload maximum 3 reference images');
      return;
    }

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) { // Reduced to 2MB limit
        alert('Each image must be less than 2MB to avoid storage issues');
        return;
      }

      // Create a canvas to compress the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px on longest side)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64 (JPEG with 0.7 quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const imageData = {
          file: compressedDataUrl,
          name: file.name,
          size: Math.round(compressedDataUrl.length * 0.75), // Approximate compressed size
          type: 'image/jpeg'
        };

        try {
          setFormData(prev => ({
            ...prev,
            referenceImages: [...prev.referenceImages, imageData]
          }));

          setImagePreview(prev => [...prev, imageData]);
        } catch (error) {
          console.error('Error storing image:', error);
          alert('Failed to store image. Image may be too large. Try a smaller image.');
        }
      };
      
      img.onerror = () => {
        alert('Failed to process image. Please try a different image.');
      };
      
      // Start loading the image
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    e.target.value = '';
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.categories.length || 
        !formData.difficulty || !formData.budget || !formData.deadline || !formData.contact) {
      alert('Please fill in all required fields including contact information');
      return;
    }

    // Check storage before attempting to save
    if (isStorageHigh()) {
      const confirm = window.confirm(
        'Storage is getting full. Would you like to clean up old data before saving? This may help avoid issues with saving your bounty.'
      );
      if (confirm) {
        const cleanup = forceCleanupIfNeeded();
        if (cleanup) {
          alert(`Cleaned up ${cleanup.freedKB}KB of storage. Your bounty should save successfully now.`);
        }
      }
    }

    setLoading(true);

    try {
      if (isEditMode && editBountyId) {
        // Update existing bounty
        const updatedData = {
          ...formData,
          budget: parseFloat(formData.budget) || 0 // Ensure budget is a number
        };
        const success = updateBounty(editBountyId, updatedData);
        
        if (success) {
          // Log the activity
          logActivity(
            session.user.email,
            ACTIVITY_TYPES.BOUNTY_UPDATED,
            { 
              bountyId: editBountyId,
              bountyTitle: formData.title,
              categories: formData.categories,
              budget: formData.budget
            }
          );

          alert('Bounty updated successfully!');
          router.push('/my-bounties');
        } else {
          alert('Failed to update bounty. Please try again.');
        }
      } else {
        // Create new bounty
        const bountyData = {
          ...formData,
          budget: parseFloat(formData.budget) || 0, // Ensure budget is a number
          createdAt: new Date().toISOString(),
          status: 'open',
          creator: session.user.email,
          applicants: []
        };

        const success = saveBounty(bountyData, session.user.email);
        
        if (success) {
          // Log the activity
          logActivity(
            session.user.email,
            ACTIVITY_TYPES.BOUNTY_CREATED,
            { 
              bountyTitle: formData.title,
              categories: formData.categories,
              budget: formData.budget
            }
          );

          alert('Bounty created successfully!');
          router.push('/my-bounties');
        } else {
          alert('Failed to create bounty. This might be due to storage limitations. Try reducing image sizes or removing some images.');
        }
      }
    } catch (error) {
      console.error('Error saving bounty:', error);
      alert('An error occurred while saving the bounty.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-pink-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <PurplePetals />
      <BountyPosterNavbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              {isEditMode ? 'Edit Bounty' : 'Create New Bounty'}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bounty Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a clear, descriptive title for your bounty"
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of what you need accomplished"
                  rows={4}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-vertical"
                  required
                />
              </div>

              {/* Reference Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Images (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-pink-300 border-dashed rounded-xl cursor-pointer bg-pink-50 hover:bg-pink-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-pink-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-pink-600">
                          <span className="font-semibold">Click to upload</span> reference images
                        </p>
                        <p className="text-xs text-pink-500">PNG, JPG or JPEG (Max 3 images, 2MB each - auto-compressed)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {imagePreview.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.file}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-pink-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Upload reference images to help creators understand your vision better. These could be mockups, examples, or inspiration images.
                  </p>
                  
                  {/* Storage Usage Indicator */}
                  {storageInfo && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Storage Usage:</span>
                        <span className={`font-medium ${
                          storageInfo.percentage > 90 ? 'text-red-600' :
                          storageInfo.percentage > 80 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {storageInfo.usedMB}MB / {storageInfo.limitMB}MB ({storageInfo.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            storageInfo.percentage > 90 ? 'bg-red-500' :
                            storageInfo.percentage > 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                        ></div>
                      </div>
                      {storageInfo.percentage > 80 && (
                        <p className="mt-1 text-xs text-yellow-600">
                          Storage is getting full. Consider cleaning up old data if you encounter issues.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories * (Select up to 3)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {BOUNTY_CATEGORIES.map(category => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.categories.includes(category.id)
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : 'border-pink-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{category.name}</div>
                    </div>
                  ))}
                </div>
                {formData.categories.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {formData.categories.length}/3 categories
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  required
                >
                  <option value="">Select difficulty level</option>
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (USD) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Enter budget amount"
                  min="1"
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  required
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  required
                />
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Email, Discord, Telegram, or preferred contact method"
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide how hunters can reach you (e.g., email@example.com, Discord: username#1234, Telegram: @username)
                </p>
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Deliverables
                </label>
                <textarea
                  name="deliverables"
                  value={formData.deliverables}
                  onChange={handleInputChange}
                  placeholder="Describe what you expect to receive upon completion"
                  rows={3}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-vertical"
                />
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Any additional details, requirements, or preferences"
                  rows={3}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-vertical"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading 
                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                    : (isEditMode ? 'Update Bounty' : 'Create Bounty')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateBounty = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-purple-700">Loading...</h1>
        </div>
      </div>
    }>
      <CreateBountyContent />
    </Suspense>
  );
};

export default CreateBounty;

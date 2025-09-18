'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import Image from 'next/image';
import PurplePetals from '@/components/PurplePetals';
import { getUserRole } from '@/utils/authMongoDB';
import { getBountyById, updateBounty, DIFFICULTY_LEVELS, isBountyOwner, getSkillToCategory } from '@/utils/bountyDataMongoDB';
import { logActivity, ACTIVITY_TYPES } from '@/utils/activityDataMongoDB';



const CreateBounty = () => {
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
    skills: [], // Changed from categories to skills
    difficulty: '',
    budget: '',
    deadline: '',
    estimatedDuration: '', // Added missing field
    contact: '',
    deliverables: '',
    additionalInfo: '',
    referenceImages: []
  });

  const [imagePreview, setImagePreview] = useState([]);

  // Theme colors - always purple for bounty poster pages
  const themeColors = useMemo(() => ({
    gradient: 'from-purple-600 to-purple-400',
    text: 'text-purple-600',
    textLight: 'text-purple-500',
    bg: 'bg-purple-50',
    bgGradient: 'from-purple-50 via-white to-purple-100',
    border: 'border-purple-200',
    ring: 'ring-purple-500',
    cardBg: 'bg-white/80',
    button: 'from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600',
    buttonSecondary: 'border-purple-200 text-purple-600 hover:bg-purple-50',
    input: 'w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors'
  }), []);

  // Available skills (same as profile-setup)
  const availableSkills = [
    '🎵 Music Producer & Sound Designer',
    '🎨 Digital Artist & Illustrator',
    '✨ 2D/3D Animation Specialist',
    '🎬 Video Editor & Content Creator',
    '💻 Full-Stack Web Developer',
    '📱 Mobile App Developer',
    '🎮 Game Developer & Designer',
    '📸 Professional Photographer',
    '✍️ Content Writer & Copywriter',
    '🖌️ UI/UX & Graphic Designer',
    '🎭 Voice Actor & Narrator',
    '🔊 Audio Engineer & Mixer',
    '📊 Data Analyst & Researcher',
    '🤖 AI/ML Engineer',
    '🎪 Digital Marketing Expert'
  ];

  // Duration options
  const durationOptions = [
    '1-3 days',
    '1 week',
    '2 weeks',
    '1 month',
    '2-3 months',
    '3+ months'
  ];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Use session role for immediate access, fallback to getUserRole
    const userRole = session?.user?.role || getUserRole(session.user.email);
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
            skills: existingBounty.skills || existingBounty.categories || [], // Support both skills and legacy categories
            difficulty: existingBounty.difficulty || '',
            budget: existingBounty.budget || '',
            deadline: existingBounty.deadline || '',
            estimatedDuration: existingBounty.estimatedDuration || '',
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

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const skills = prev.skills || [];
      if (skills.includes(skill)) {
        return {
          ...prev,
          skills: skills.filter(s => s !== skill)
        };
      } else if (skills.length < 3) {
        return {
          ...prev,
          skills: [...skills, skill]
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
      const img = new Image();
      
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
    
    if (!formData.title || !formData.description || !formData.skills?.length || 
        !formData.difficulty || !formData.budget || !formData.deadline || 
        !formData.estimatedDuration || !formData.contact) {
      alert('Please fill in all required fields including at least one skill, estimated duration, and contact information');
      return;
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
          await logActivity(
            session.user.email,
            ACTIVITY_TYPES.BOUNTY_UPDATED,
            `Updated bounty: ${formData.title}`,
            { 
              bountyId: editBountyId,
              bountyTitle: formData.title,
              skills: formData.skills,
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
        // First get the user ID for the API
        const userResponse = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
        const userData = await userResponse.json();
        
        if (!userData.success || !userData.data) {
          alert('Error: User not found. Please try logging in again.');
          setLoading(false);
          return;
        }
        
        const bountyData = {
          title: formData.title,
          description: formData.description,
          category: formData.skills.length > 0 ? getSkillToCategory(formData.skills[0]) : 'Other', // Map first skill to valid category
          skillsRequired: formData.skills, // Use skills instead of empty array
          rewardAmount: parseFloat(formData.budget) || 0, // Map budget to rewardAmount
          deadline: formData.deadline,
          estimatedDuration: formData.estimatedDuration, // Add missing field
          difficultyLevel: formData.difficulty, // Map difficulty to difficultyLevel
          requirements: formData.deliverables ? [formData.deliverables] : [], // Map deliverables to requirements
          additionalInfo: formData.additionalInfo || '',
          contactInfo: formData.contact || '',
          referenceImages: formData.referenceImages || [],
          postedBy: userData.data._id, // Use the user's MongoDB ID
          createdAt: new Date().toISOString(),
          status: 'open'
        };

        const response = await fetch('/api/bounties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bountyData),
        });

        const result = await response.json();
        
        if (result.success) {
          // Log the activity
          await logActivity(
            session.user.email,
            ACTIVITY_TYPES.BOUNTY_CREATED,
            `Created bounty: ${formData.title}`,
            { 
              bountyId: result.data._id,
              bountyTitle: formData.title,
              skills: formData.skills,
              budget: formData.budget,
              estimatedDuration: formData.estimatedDuration
            }
          );

          alert('Bounty created successfully!');
          router.push('/my-bounties');
        } else {
          alert(`Failed to create bounty: ${result.error || 'Unknown error'}`);
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
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} flex items-center justify-center`}>
        <div className={`text-xl ${themeColors.text}`}>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient}`}>
      <PurplePetals />
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className={`${themeColors.cardBg} backdrop-blur-sm rounded-2xl shadow-xl border ${themeColors.border} p-8`}>
            <h1 className={`text-3xl font-bold ${themeColors.text} mb-8 text-center`}>
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
                  className={themeColors.input}
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
                  className={`${themeColors.input} resize-vertical`}
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
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-purple-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-purple-600">
                          <span className="font-semibold">Click to upload</span> reference images
                        </p>
                        <p className="text-xs text-purple-500">PNG, JPG or JPEG (Max 3 images, 2MB each - auto-compressed)</p>
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
                        <div key={index} className="relative group h-32">
                          <img
                            src={image.file}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-purple-200"
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
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills * (Select up to 3)
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Select the skills needed for this bounty. This helps creators understand what expertise is required.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSkills.map((skill) => {
                    const isSelected = formData.skills.includes(skill);
                    const canSelect = formData.skills.length < 3 || isSelected;
                    
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        disabled={!canSelect}
                        className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-300 text-left ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-purple-400 text-white border-purple-400 shadow-lg transform scale-105'
                            : canSelect
                              ? 'bg-white/60 text-purple-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:scale-102'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {formData.skills.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200">
                    <p className="text-purple-700 font-medium mb-2">Selected Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 text-white text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i < formData.skills.length
                              ? 'bg-gradient-to-r from-purple-500 to-purple-400 shadow-sm'
                              : 'bg-purple-200'
                          }`}
                        />
                      ))}
                      <span className="text-purple-600 text-sm ml-2">
                        {formData.skills.length}/3 selected
                      </span>
                    </div>
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
                  className={themeColors.input}
                  required
                >
                  <option value="">Select difficulty level</option>
                  {DIFFICULTY_LEVELS.map((level, index) => (
                    <option key={level.name} value={level.name}>
                      {level.name}
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
                  className={themeColors.input}
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
                  className={themeColors.input}
                  required
                />
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration *
                </label>
                <select
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className={themeColors.input}
                  required
                >
                  <option value="">Select estimated duration</option>
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
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
                  className={themeColors.input}
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
                  className={`${themeColors.input} resize-vertical`}
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
                  className={`${themeColors.input} resize-vertical`}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className={`px-6 py-3 border ${themeColors.buttonSecondary} rounded-xl transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 bg-gradient-to-r ${themeColors.button} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
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

export default CreateBounty;

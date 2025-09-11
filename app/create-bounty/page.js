'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import PurplePetals from '@/components/PurplePetals';
import { getUserRole } from '@/utils/userData';
import { saveBounty, getBountyById, updateBounty, BOUNTY_CATEGORIES, DIFFICULTY_LEVELS, isBountyOwner } from '@/utils/bountyData';
import { logActivity, ACTIVITY_TYPES } from '@/utils/activityData';



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
    categories: [],
    difficulty: '',
    budget: '',
    deadline: '',
    contact: '',
    deliverables: '',
    additionalInfo: ''
  });

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
            additionalInfo: existingBounty.additionalInfo || ''
          });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.categories.length || 
        !formData.difficulty || !formData.budget || !formData.deadline || !formData.contact) {
      alert('Please fill in all required fields including contact information');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && editBountyId) {
        // Update existing bounty
        const success = updateBounty(editBountyId, formData);
        
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
          alert('Failed to create bounty. Please try again.');
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
      <DashboardNavbar />
      
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

export default CreateBounty;

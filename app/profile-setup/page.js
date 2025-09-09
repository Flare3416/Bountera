'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { saveUserData, getAllUserData, cleanupBlobUrls } from '@/utils/userData';
import SakuraPetals from '@/components/SakuraPetals';

const ProfileSetup = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const profileImageRef = useRef(null);
  const backgroundImageRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    skills: [],
    profileImage: null,
    backgroundImage: null,
    bio: '',
    experience: [],
    projects: [],
    achievements: [],
    socialLinks: []
  });

  // Auto-save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const autoSaveTimerRef = useRef(null);

  // Generate draft key based on user email
  const getDraftKey = () => session?.user?.email ? `creator-profile-draft-${session.user.email}` : null;

  // Auto-save functions
  const saveDraft = async () => {
    const draftKey = getDraftKey();
    if (!draftKey) return;

    try {
      setIsSaving(true);
      setSaveStatus('Saving draft...');
      
      const draftData = {
        ...formData,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      
      setSaveStatus('Draft saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(''), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const loadDraft = () => {
    const draftKey = getDraftKey();
    if (!draftKey) return null;

    try {
      const draftData = localStorage.getItem(draftKey);
      return draftData ? JSON.parse(draftData) : null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  };

  const clearDraft = () => {
    const draftKey = getDraftKey();
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  };

  // Auto-save timer
  const scheduleAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 1000); // Auto-save 1 second after user stops typing
  };

  // Load existing user data and drafts when session is available
  useEffect(() => {
    if (session?.user?.email) {
      // Clean up any blob URLs first
      cleanupBlobUrls(session.user.email);
      
      // Try to load draft first
      const draftData = loadDraft();
      const existingData = getAllUserData(session);
      
      // Use draft if available and newer than saved data
      const dataToUse = draftData && (!existingData?.lastModified || 
        new Date(draftData.lastSaved || 0) > new Date(existingData.lastModified || 0)) 
        ? draftData : existingData;
      
      if (dataToUse) {
        setFormData({
          name: dataToUse.name || session.user.name || '',
          skills: Array.isArray(dataToUse.skills) ? dataToUse.skills : [],
          profileImage: dataToUse.profileImage || null,
          backgroundImage: dataToUse.backgroundImage || null,
          bio: dataToUse.bio || '',
          experience: Array.isArray(dataToUse.experience) ? dataToUse.experience : [],
          projects: Array.isArray(dataToUse.projects) ? dataToUse.projects : [],
          achievements: Array.isArray(dataToUse.achievements) ? dataToUse.achievements : [],
          socialLinks: Array.isArray(dataToUse.socialLinks) ? dataToUse.socialLinks : []
        });
        
        if (draftData && draftData.lastSaved) {
          setSaveStatus('Draft recovered');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } else {
        // If no existing data or draft, use session data as defaults
        setFormData(prev => ({
          ...prev,
          name: session.user.name || ''
        }));
      }
    }
  }, [session]);

  // Auto-save effect - trigger when form data changes
  useEffect(() => {
    if (session?.user?.email && formData.name) { // Only auto-save if form has content
      scheduleAutoSave();
    }
  }, [formData, session?.user?.email]);

  // Page Visibility API - save when user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session?.user?.email && formData.name) {
        saveDraft();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [formData, session?.user?.email]);

  // Periodic backup save every 30 seconds
  useEffect(() => {
    const backupInterval = setInterval(() => {
      if (session?.user?.email && formData.name) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(backupInterval);
  }, [formData, session?.user?.email]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const skillOptions = [
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

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : prev.skills.length < 3 ? [...prev.skills, skill] : prev.skills
    }));
    // Trigger auto-save
    scheduleAutoSave();
  };

  const handleImageUpload = (type, file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please choose an image under 5MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setFormData(prev => ({
          ...prev,
          [type]: base64Image
        }));
        scheduleAutoSave();
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null
    }));
    scheduleAutoSave();
  };

  const handleImageEdit = (type) => {
    if (type === 'profileImage') {
      profileImageRef.current?.click();
    } else if (type === 'backgroundImage') {
      backgroundImageRef.current?.click();
    }
  };

  // Experience handlers
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
    }));
    scheduleAutoSave();
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
    scheduleAutoSave();
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    scheduleAutoSave();
  };

  // Projects handlers
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: [], link: '', image: '' }]
    }));
    scheduleAutoSave();
  };

  const updateProject = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
    scheduleAutoSave();
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
    scheduleAutoSave();
  };

  // Achievements handlers
  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', description: '', icon: '🏆' }]
    }));
    scheduleAutoSave();
  };

  const updateAchievement = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? { ...achievement, [field]: value } : achievement
      )
    }));
    scheduleAutoSave();
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
    scheduleAutoSave();
  };

  // Social links handlers
  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '', icon: '🔗' }]
    }));
    scheduleAutoSave();
  };

  const updateSocialLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
    scheduleAutoSave();
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
    scheduleAutoSave();
  };

  // Project image upload handler
  const handleProjectImageUpload = (index, file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please choose an image under 5MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        updateProject(index, 'image', base64Image);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      console.error('No user email found');
      return;
    }

    // Save user data to localStorage
    const userData = {
      name: formData.name,
      skills: formData.skills,
      bio: formData.bio,
      profileImage: formData.profileImage,
      backgroundImage: formData.backgroundImage,
      experience: formData.experience,
      projects: formData.projects,
      achievements: formData.achievements,
      socialLinks: formData.socialLinks,
      lastModified: new Date().toISOString()
    };

    saveUserData(session.user.email, userData);
    
    // Clear draft after successful save
    clearDraft();
    
    // Redirect to dashboard after setup
    router.push('/dashboard');
  };

  // Handle authentication redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 relative overflow-hidden">
      {/* Sakura Petals Background */}
      <SakuraPetals />

      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl space-y-8">
          {/* Welcome Header */}
          <div className="text-center mb-8 p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-4xl mb-2">🌸</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-2">
              Welcome to Bountera!
            </h1>
            <p className="text-pink-700/80 text-lg font-medium mb-2">
              Hi {session?.user?.name}! Let's set up your creator profile
            </p>
            <p className="text-pink-600/70">
              Tell us about yourself and showcase your talents to the world
            </p>
          </div>

          {/* Profile Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Image Upload */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h3 className="text-2xl font-bold text-pink-700 mb-4">🖼️ Background Image</h3>
              <div 
                className="relative h-40 rounded-2xl border-2 border-dashed border-pink-300 bg-gradient-to-r from-pink-100 to-pink-50 flex items-center justify-center cursor-pointer hover:bg-pink-100 transition-all duration-300"
                onClick={() => backgroundImageRef.current?.click()}
                style={{
                  backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!formData.backgroundImage && (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-pink-600 font-medium">Click to upload background image</p>
                    <p className="text-pink-500 text-sm">PNG, JPG up to 5MB</p>
                  </div>
                )}
                {formData.backgroundImage && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageEdit('backgroundImage');
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <img src="/edit-icon.svg" alt="Edit" className="w-4 h-4 text-pink-600" style={{filter: 'invert(38%) sepia(89%) saturate(1346%) hue-rotate(314deg) brightness(95%) contrast(94%)'}} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDelete('backgroundImage');
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <img src="/delete-icon.svg" alt="Delete" className="w-4 h-4 text-red-500" style={{filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'}} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={backgroundImageRef}
                  accept="image/*"
                  onChange={(e) => handleImageUpload('backgroundImage', e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Picture and Name */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h3 className="text-2xl font-bold text-pink-700 mb-6">👤 Profile Information</h3>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div 
                      className="w-32 h-32 rounded-full border-4 border-pink-300 bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden"
                      onClick={() => profileImageRef.current?.click()}
                      style={{
                        backgroundImage: formData.profileImage ? `url(${formData.profileImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!formData.profileImage && (
                        <div className="text-center">
                          <div className="text-3xl mb-1">📷</div>
                          <p className="text-pink-600 text-sm font-medium">Upload Photo</p>
                        </div>
                      )}
                    </div>
                    {formData.profileImage && (
                      <div className="absolute -bottom-2 -right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageEdit('profileImage');
                          }}
                          className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                        >
                          <img src="/edit-icon.svg" alt="Edit" className="w-3 h-3" style={{filter: 'invert(38%) sepia(89%) saturate(1346%) hue-rotate(314deg) brightness(95%) contrast(94%)'}} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageDelete('profileImage');
                          }}
                          className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                        >
                          <img src="/delete-icon.svg" alt="Delete" className="w-3 h-3" style={{filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'}} />
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={profileImageRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload('profileImage', e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {/* Name and Bio */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-pink-700 font-semibold mb-2">Display Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        scheduleAutoSave();
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white/80 text-pink-800 placeholder-pink-400"
                      placeholder="Enter your display name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-pink-700 font-semibold mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, bio: e.target.value }));
                        scheduleAutoSave();
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white/80 text-pink-800 placeholder-pink-400 h-24 resize-none"
                      placeholder="Tell everyone about yourself..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Selection */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h3 className="text-2xl font-bold text-pink-700 mb-4">🎯 Your Skills</h3>
              <p className="text-pink-600 mb-2">Select up to 3 skills that best represent your expertise</p>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < formData.skills.length
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 shadow-sm'
                          : 'bg-pink-200'
                      }`}
                    />
                  ))}
                  <span className="text-pink-600 text-sm ml-2">
                    {formData.skills.length}/3 selected
                  </span>
                </div>
                {formData.skills.length === 3 && (
                  <span className="text-pink-500 text-sm bg-pink-100 px-3 py-1 rounded-full">
                    Maximum reached
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {skillOptions.map((skill) => {
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
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white border-pink-400 shadow-lg transform scale-105'
                          : canSelect
                          ? 'bg-white/60 text-pink-700 border-pink-200 hover:border-pink-400 hover:bg-pink-50 hover:scale-102'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {formData.skills.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-pink-100 to-pink-50 border border-pink-200">
                  <p className="text-pink-700 font-medium mb-2">Selected Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-400 text-white text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Experience Section */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-pink-700">💼 Experience</h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
                >
                  + Add Experience
                </button>
              </div>
              {formData.experience.map((exp, index) => (
                <div key={index} className="mb-4 p-4 rounded-xl bg-pink-50 border border-pink-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💼</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <div>
                          <label className="block text-pink-700 font-medium mb-1 text-sm">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-pink-700 font-medium mb-1 text-sm">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                            placeholder="e.g., Tech Corp"
                          />
                        </div>
                      </div>
                    </div>
                    {exp.title && exp.company && exp.duration && exp.description && (
                      <div className="flex items-center space-x-2 ml-3">
                        <div className="text-green-500 text-xl">✓</div>
                        <span className="text-green-600 text-sm font-medium">Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-pink-700 font-medium mb-1 text-sm">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                      placeholder="e.g., Jan 2020 - Present"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-pink-700 font-medium mb-1 text-sm">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors resize-vertical"
                      rows="3"
                      placeholder="Describe your role and achievements..."
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="px-3 py-1 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                    {exp.title && exp.company && exp.duration && exp.description && (
                      <button
                        type="button"
                        onClick={addExperience}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        + Add Another
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Projects Section */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-pink-700">🚀 Projects Showcase</h3>
                <button
                  type="button"
                  onClick={addProject}
                  className="px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
                >
                  + Add Project
                </button>
              </div>
              {formData.projects.map((project, index) => (
                <div key={index} className="mb-4 p-4 rounded-xl bg-pink-50 border border-pink-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🚀</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <div>
                          <label className="block text-pink-700 font-medium mb-1 text-sm">Project Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProject(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                            placeholder="e.g., E-commerce App"
                          />
                        </div>
                        <div>
                          <label className="block text-pink-700 font-medium mb-1 text-sm">Project Link</label>
                          <input
                            type="url"
                            value={project.link}
                            onChange={(e) => updateProject(index, 'link', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>
                    </div>
                    {project.title && project.description && project.technologies.length > 0 && (
                      <div className="flex items-center space-x-2 ml-3">
                        <div className="text-green-500 text-xl">✓</div>
                        <span className="text-green-600 text-sm font-medium">Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-pink-700 font-medium mb-1 text-sm">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors resize-vertical"
                      rows="3"
                      placeholder="Describe what this project does and your role..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-pink-700 font-medium mb-1 text-sm">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={project.technologies.join(', ')}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                      className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-pink-700 font-medium mb-1 text-sm">Project Image</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProjectImageUpload(index, e.target.files[0])}
                          className="flex-1 px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors text-sm"
                        />
                        {project.image && (
                          <button
                            type="button"
                            onClick={() => updateProject(index, 'image', '')}
                            className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-sm"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {project.image && (
                        <img 
                          src={project.image} 
                          alt="Project preview" 
                          className="w-full h-32 object-cover rounded-lg border border-pink-200"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="px-3 py-1 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                    {project.title && project.description && project.technologies.length > 0 && (
                      <button
                        type="button"
                        onClick={addProject}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        + Add Another
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Section */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-pink-700">🏆 Achievements</h3>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
                >
                  + Add Achievement
                </button>
              </div>
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏆</div>
                      <div className="flex-1">
                        <label className="block text-pink-700 font-medium mb-1 text-sm">Achievement Title</label>
                        <input
                          type="text"
                          value={achievement.title}
                          onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-yellow-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                          placeholder="e.g., Best Developer Award 2024"
                        />
                      </div>
                    </div>
                    {achievement.title && achievement.description && (
                      <div className="flex items-center space-x-2 ml-3">
                        <div className="text-green-500 text-xl">✓</div>
                        <span className="text-green-600 text-sm font-medium">Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-pink-700 font-medium mb-1 text-sm">Description</label>
                    <textarea
                      value={achievement.description}
                      onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-yellow-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors resize-vertical"
                      rows="2"
                      placeholder="Describe what you achieved..."
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="px-3 py-1 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                    {achievement.title && achievement.description && (
                      <button
                        type="button"
                        onClick={addAchievement}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        + Add Another
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links Section */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-pink-700">📱 Social Links</h3>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
                >
                  + Add Link
                </button>
              </div>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-2xl">🔗</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <div>
                          <label className="block text-pink-700 font-medium mb-1 text-sm">Platform</label>
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                            placeholder="GitHub"
                          />
                        </div>
                        <div>
                          <label className="block text-pink-700 font-medium mb-1 text-sm">URL</label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-colors"
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>
                    </div>
                    {link.platform && link.url && (
                      <div className="flex items-center space-x-2 ml-3">
                        <div className="text-green-500 text-xl">✓</div>
                        <span className="text-green-600 text-sm font-medium">Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-1 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                    {link.platform && link.url && (
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        + Add Another
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-save Status */}
            {saveStatus && (
              <div className="text-center mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  saveStatus.includes('saved') || saveStatus.includes('recovered') 
                    ? 'bg-green-100 text-green-600' 
                    : saveStatus.includes('failed') 
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {isSaving && <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-2"></div>}
                  {saveStatus}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={formData.skills.length === 0 || !formData.name.trim()}
                className="px-12 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                🚀 Complete Profile Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;

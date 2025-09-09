'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';

const UserProfile = () => {
  const { username } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchUserProfile = () => {
      try {
        // Get all stored user data from localStorage
        const storedData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes('@') && !key.includes('draft_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              const userKey = key.split('_profile_')[1] || key.split('_poster_')[1];
              if (data && userKey) {
                storedData[userKey] = data;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }

        // Find user by username
        let foundUser = null;
        Object.entries(storedData).forEach(([email, data]) => {
          if (data.username === username) {
            foundUser = { ...data, email };
          }
        });

        if (foundUser) {
          setUserData(foundUser);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-pink-700 mb-2">Profile Not Found</h1>
          <p className="text-pink-600 mb-4">The user @{username} doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-pink-100 relative overflow-hidden">
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      {/* Sakura Petals Effect */}
      <SakuraPetals />

      {/* Main Content */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-pink-700 mb-2">
              @{userData.username}
            </h1>
            <p className="text-pink-600">Creator Profile</p>
          </div>

          {/* Profile Card */}
          <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card overflow-hidden">
            {/* Banner Image */}
            <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-400 overflow-hidden">
              {userData.bannerImage ? (
                <img
                  src={userData.bannerImage}
                  alt="Profile Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/deafultbanner.jpeg"
                  alt="Default Profile Banner"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
            </div>
            
            {/* Profile Info */}
            <div className="px-6 pb-6 relative -mt-12">
              <div className="flex items-start space-x-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 rounded-full border-4 border-pink-500 shadow-xl bg-white overflow-hidden">
                    {userData.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/defaultpfp.jpg"
                        alt="Default Profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                
                {/* Profile Details */}
                <div className="flex-1 min-w-0 pt-16">
                  <h1 className="text-2xl font-bold text-pink-700 truncate mb-1">
                    {userData.name}
                  </h1>
                  
                  {/* User Skills */}
                  {userData?.skills && userData.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {userData.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-sm rounded-full font-medium shadow-sm"
                          >
                            {skill.length > 15 ? skill.substring(0, 15) + '...' : skill}
                          </span>
                        ))}
                        {userData.skills.length > 3 && (
                          <span className="inline-block px-3 py-1.5 bg-pink-100 text-pink-600 text-sm rounded-full font-medium shadow-sm">
                            +{userData.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            {userData?.bio && (
              <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
                <h2 className="text-2xl font-bold text-pink-700 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📝</span>
                  About Me
                </h2>
                <p className="text-pink-600 leading-relaxed">{userData.bio}</p>
              </div>
            )}

            {/* Experience Section */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h2 className="text-2xl font-bold text-pink-700 mb-4 flex items-center">
                <span className="text-2xl mr-2">💼</span>
                Experience
              </h2>
              {userData?.experience && userData.experience.length > 0 ? (
                <div className="space-y-4">
                  {userData.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-pink-300 pl-4 py-2">
                      <h3 className="font-bold text-pink-700">{exp.title}</h3>
                      <p className="text-pink-600 text-sm">{exp.company}</p>
                      <p className="text-pink-500 text-xs">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-pink-600 text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💼</div>
                  <p className="text-pink-600">No experience added yet</p>
                </div>
              )}
            </div>

            {/* Projects Showcase Section */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h2 className="text-2xl font-bold text-pink-700 mb-4 flex items-center">
                <span className="text-2xl mr-2">🚀</span>
                Projects Showcase
              </h2>
              {userData?.projects && userData.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.projects.map((project, index) => (
                    <div key={index} className="border border-pink-200 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                      {project.image && (
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-pink-700 mb-1">{project.title}</h3>
                      <p className="text-pink-600 text-sm mb-2">{project.description}</p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🚀</div>
                  <p className="text-pink-600">No projects showcased yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact/Social Links */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h2 className="text-xl font-bold text-pink-700 mb-4 flex items-center">
                <span className="text-xl mr-2">📱</span>
                Connect
              </h2>
              {userData?.socialLinks && userData.socialLinks.length > 0 ? (
                <div className="space-y-2">
                  {userData.socialLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="text-pink-600 hover:text-pink-700">{link.platform}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📱</div>
                  <p className="text-pink-600 text-sm">No social links added</p>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h2 className="text-xl font-bold text-pink-700 mb-4 flex items-center">
                <span className="text-xl mr-2">📊</span>
                Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-pink-600">Profile Views:</span>
                  <span className="font-bold text-pink-700">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-600">Bounties Completed:</span>
                  <span className="font-bold text-pink-700">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-600">Rank:</span>
                  <span className="font-bold text-pink-700">#--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-600">Member Since:</span>
                  <span className="font-bold text-pink-700">2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

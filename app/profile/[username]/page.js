'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BountyHunterNavbar from '@/components/BountyHunterNavbar';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import Navbar from '@/components/Navbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserRole } from '@/utils/userData';
import { getUserPoints, getUserRank } from '@/utils/pointsSystem';
import { getApplicationsForUser } from '@/utils/applicationData';
import { logActivity } from '@/utils/activityData';
import { addDonation } from '@/utils/donationData';

const UserProfile = () => {
  const { username } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateName, setDonateName] = useState('');
  const [donateMessage, setDonateMessage] = useState('');
  const [userStats, setUserStats] = useState({
    points: 0,
    rank: null,
    applications: { total: 0, completed: 0 }
  });

  useEffect(() => {
    // Load profile data regardless of authentication status
    const fetchUserProfile = () => {
      try {
        // Get all stored user data from localStorage
        const storedData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('user_') && key.includes('@')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              const email = key.replace('user_', '');
              if (data && email) {
                storedData[email] = data;
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
          
          // Load user stats if this is a creator
          if (foundUser.role === 'creator' && foundUser.email) {
            const points = getUserPoints(foundUser.email);
            const rank = getUserRank(foundUser.email);
            const applications = getApplicationsForUser(foundUser.email);
            const completedApplications = applications.filter(app => app.status === 'completed').length;
            
            setUserStats({
              points,
              rank,
              applications: { 
                total: applications.length, 
                completed: completedApplications 
              }
            });
          }
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

    fetchUserProfile();
  }, [username]);

  // Open donate modal with pre-filled name
  const openDonateModal = () => {
    setDonateName(session?.user?.name || '');
    setShowDonateModal(true);
  };

  // Donation handler
  const handleDonate = () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert('Please enter a valid donation amount!');
      return;
    }

    if (!donateName.trim()) {
      alert('Please enter your name!');
      return;
    }

    // Get donor info
    const donorEmail = session?.user?.email || 'anonymous';

    // Create donation record
    const donation = {
      to: userData.username,
      toEmail: userData.email,
      from: donateName.trim(),
      fromEmail: donorEmail,
      amount: parseFloat(donateAmount),
      message: donateMessage
    };

    // Store donation using utility
    addDonation(donation);

    // Log activity for the hunter
    logActivity(
      userData.email,
      'donation_received',
      `Received $${donateAmount} donation from ${donateName}${donateMessage ? ': ' + donateMessage : ''}`
    );

    // Log activity for the donor if logged in
    if (session?.user?.email) {
      logActivity(
        session.user.email,
        'donation_sent',
        `Donated $${donateAmount} to @${userData.username}${donateMessage ? ': ' + donateMessage : ''}`
      );
    }

    // Show success and reset
    alert(`Successfully donated $${donateAmount} to @${userData.username}! Thank you for your support! 🎉`);
    setShowDonateModal(false);
    setDonateAmount('');
    setDonateName('');
    setDonateMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <SakuraPetals />
        <div className="text-center relative z-10">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-4xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-pink-700 mb-2">Loading Profile...</h1>
            <p className="text-pink-600">Please wait while we load {username}'s profile</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <SakuraPetals />
        <div className="text-center relative z-10">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-3xl font-bold text-pink-700 mb-2">Profile Not Found</h1>
            <p className="text-pink-600 mb-6">The user @{username} doesn't exist or hasn't completed their profile setup.</p>
            <button
              onClick={() => router.push('/leaderboard')}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              ← Back to Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = getUserRole(session);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 relative overflow-hidden">
      {/* Navbar - Show role-specific navbar for logged-in users, regular navbar for guests */}
      {session ? (
        userRole === 'bounty_poster' ? <BountyPosterNavbar /> : <BountyHunterNavbar />
      ) : (
        <Navbar />
      )}

      
      {/* Sakura Petals Background */}
      <SakuraPetals />

      {/* Main Content */}
      <div className="relative z-20 p-6 pt-20">
        {/* Profile Banner Section */}
        {userData && (
          <div className="max-w-6xl mx-auto mb-8 mt-12">
            <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-400 overflow-hidden">
                {userData.backgroundImage || userData.bannerImage ? (
                  <Image
                    src={userData.backgroundImage || userData.bannerImage}
                    alt="Profile Banner"
                    width={800}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="/defaultbanner.jpeg"
                    alt="Default Profile Banner"
                    width={800}
                    height={200}
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
                        <Image
                          src={userData.profileImage}
                          alt="Profile"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src="/defaultpfp.jpg"
                          alt="Default Profile"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1 min-w-0 pt-12">
                    <h1 className="text-2xl font-bold text-pink-700 truncate mb-1">
                      {userData.name}
                    </h1>
                    <p className="text-pink-500 text-sm mb-2">@{userData.username}</p>
                    
                    
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
                  
                  {/* Donate Button - Only show for bounty hunters when viewer is not the owner */}
                  {userData?.role === 'creator' && (!session || session.user?.email !== userData.email) && (
                    <div className="flex-shrink-0 mt-14">
                      <button
                        onClick={openDonateModal}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-400 text-white rounded-2xl hover:from-yellow-600 hover:via-yellow-500 hover:to-amber-500 transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105 flex items-center space-x-2 border-2 border-yellow-300"
                      >
                        <span className="text-2xl">💝</span>
                        <span>Support</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <button 
                    onClick={() => router.push('/profile-setup')}
                    className="mt-2 text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Add your experience
                  </button>
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
                        <Image 
                          src={project.image} 
                          alt={project.title}
                          width={400}
                          height={128}
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
                  <button 
                    onClick={() => router.push('/profile-setup')}
                    className="mt-2 text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Add your projects
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements Section */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
              <h2 className="text-xl font-bold text-pink-700 mb-4 flex items-center">
                <span className="text-xl mr-2">🏆</span>
                Achievements
              </h2>
              {userData?.achievements && userData.achievements.length > 0 ? (
                <div className="space-y-3">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon || '🏆'}</div>
                      <div>
                        <h3 className="font-medium text-pink-700">{achievement.title}</h3>
                        <p className="text-pink-600 text-sm">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-pink-600 text-sm">No achievements yet</p>
                  <button 
                    onClick={() => router.push('/profile-setup')}
                    className="mt-2 text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    Add achievements
                  </button>
                </div>
              )}
            </div>

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
                  <button 
                    onClick={() => router.push('/profile-setup')}
                    className="mt-2 text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    Add social links
                  </button>
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
                {userData?.role === 'creator' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Leaderboard Points:</span>
                      <span className="font-bold text-pink-700">{userStats.points}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Global Rank:</span>
                      <span className="font-bold text-pink-700">#{userStats.rank || '--'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Total Applications:</span>
                      <span className="font-bold text-pink-700">{userStats.applications.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Bounties Completed:</span>
                      <span className="font-bold text-pink-700">{userStats.applications.completed}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Profile Views:</span>
                      <span className="font-bold text-pink-700">--</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Bounties Posted:</span>
                      <span className="font-bold text-pink-700">--</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">Projects Completed:</span>
                      <span className="font-bold text-pink-700">--</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-pink-600">Member Since:</span>
                  <span className="font-bold text-pink-700">
                    {userData?.lastModified ? new Date(userData.lastModified).getFullYear() : '2025'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-yellow-50/30 to-amber-50/30 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative border-2 border-yellow-200/50">
            <button
              onClick={() => {
                setShowDonateModal(false);
                setDonateAmount('');
                setDonateName('');
                setDonateMessage('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors"
            >
              ×
            </button>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">💝</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Support @{userData?.username}
              </h2>
              <p className="text-yellow-700 text-sm">Your donation helps them continue their amazing work!</p>
            </div>

            <div className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-yellow-800 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={donateName}
                  onChange={(e) => setDonateName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-bold text-yellow-800 mb-3">
                  Choose Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[5, 10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonateAmount(amount.toString())}
                      className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                        donateAmount === amount.toString()
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-yellow-300 text-yellow-700 hover:border-yellow-500 hover:scale-105'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium text-lg"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-bold text-yellow-800 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={donateMessage}
                  onChange={(e) => setDonateMessage(e.target.value)}
                  placeholder="Leave a supportive message... 💬"
                  rows="3"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all resize-none bg-white/80 backdrop-blur-sm text-gray-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowDonateModal(false);
                    setDonateAmount('');
                    setDonateName('');
                    setDonateMessage('');
                  }}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDonate}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-400 text-white rounded-2xl hover:from-yellow-600 hover:via-yellow-500 hover:to-amber-500 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>💝</span>
                  <span>Donate ${donateAmount || '0'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;


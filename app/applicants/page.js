'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import PurplePetals from '@/components/PurplePetals';
import { getUserRole } from '@/utils/userData';
import { getApplicationsForPoster, acceptApplication, rejectApplication, completeBounty, APPLICATION_STATUS, migrateBountiesCreatorFields } from '@/utils/applicationData';
import { getAllBounties, formatCurrency } from '@/utils/bountyData';

const ApplicantsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [bounties, setBounties] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Check authentication and user role
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

        loadApplications();
    }, [session, status, router]);

    // Listen for new applications
    useEffect(() => {
        const handleApplicationsUpdate = () => {
            loadApplications();
        };

        window.addEventListener('applicationsUpdated', handleApplicationsUpdate);
        
        return () => {
            window.removeEventListener('applicationsUpdated', handleApplicationsUpdate);
        };
    }, [session]);

    const loadApplications = () => {
        try {
            if (!session?.user?.email) return;

            // Run migration to ensure bounty creator fields are properly set
            migrateBountiesCreatorFields();

            // Get all applications for this poster's bounties
            const posterApplications = getApplicationsForPoster(session.user.email);
            setApplications(posterApplications);

            // Load bounty data for each application
            const allBounties = getAllBounties();
            const bountyMap = {};
            allBounties.forEach(bounty => {
                bountyMap[bounty.id] = bounty;
            });
            setBounties(bountyMap);

        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (applicationId, bountyId) => {
        if (window.confirm('Are you sure you want to accept this application? This will reject all other applications for this bounty and mark it as in-progress.')) {
            const success = acceptApplication(applicationId, bountyId);
            if (success) {
                loadApplications();
                alert('Application accepted successfully! The bounty is now in progress.');
            } else {
                alert('Failed to accept application. Please try again.');
            }
        }
    };

    const handleReject = async (applicationId) => {
        if (window.confirm('Are you sure you want to reject this application?')) {
            const success = rejectApplication(applicationId);
            if (success) {
                loadApplications();
                alert('Application rejected.');
            } else {
                alert('Failed to reject application. Please try again.');
            }
        }
    };

    const handleReviewWork = (application) => {
        setSelectedApplication(application);
        setReviewModalOpen(true);
    };

    const handleCompleteWork = (applicationId, bountyId) => {
        if (window.confirm('Are you sure you want to accept this work and complete the bounty? This will award 100 points to the creator.')) {
            const success = completeBounty(applicationId, bountyId, true);
            if (success) {
                loadApplications();
                setReviewModalOpen(false);
                alert('Work accepted! Bounty completed and 100 points awarded to the creator.');
            } else {
                alert('Failed to complete bounty. Please try again.');
            }
        }
    };

    const handleRejectWork = (applicationId, bountyId) => {
        if (window.confirm('Are you sure you want to reject this work? This will cancel the bounty.')) {
            const success = completeBounty(applicationId, bountyId, false);
            if (success) {
                loadApplications();
                setReviewModalOpen(false);
                alert('Work rejected. Bounty has been cancelled.');
            } else {
                alert('Failed to reject work. Please try again.');
            }
        }
    };

    const handleViewProfile = (application) => {
        // Navigate to profile page using username
        const username = application.applicantUsername || application.applicantEmail?.split('@')[0] || 'unknown';
        router.push(`/profile/${username}`);
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case APPLICATION_STATUS.PENDING:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case APPLICATION_STATUS.ACCEPTED:
                return 'bg-green-100 text-green-800 border-green-200';
            case APPLICATION_STATUS.REJECTED:
                return 'bg-red-100 text-red-800 border-red-200';
            case APPLICATION_STATUS.COMPLETED:
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case APPLICATION_STATUS.SUBMITTED:
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case APPLICATION_STATUS.PENDING:
                return 'Pending Review';
            case APPLICATION_STATUS.ACCEPTED:
                return 'Accepted';
            case APPLICATION_STATUS.REJECTED:
                return 'Rejected';
            case APPLICATION_STATUS.COMPLETED:
                return 'Completed';
            case APPLICATION_STATUS.SUBMITTED:
                return 'Work Submitted';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-purple-600">Loading applications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
            {/* Bounty Poster Navbar */}
            <BountyPosterNavbar />

            {/* Purple Petals Background */}
            <PurplePetals />

            {/* Main Content */}
            <div className="relative z-10 pt-20 p-6">
                <div className="max-w-6xl mx-auto mt-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center items-center space-x-3 mb-4">
                            <span className="text-5xl leading-none relative top-[2px]">📋</span>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent leading-none">
                                Applications
                            </h1>
                        </div>
                        <p className="text-purple-600 text-lg pt-2 opacity-70">
                            Manage applications for your bounties
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-8">
                        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
                            <h3 className="text-lg font-bold text-purple-700 mb-4">Filter Applications</h3>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { value: 'all', label: 'All Applications' },
                                    { value: APPLICATION_STATUS.PENDING, label: 'Pending' },
                                    { value: APPLICATION_STATUS.ACCEPTED, label: 'Accepted' },
                                    { value: APPLICATION_STATUS.SUBMITTED, label: 'Work Submitted' },
                                    { value: APPLICATION_STATUS.COMPLETED, label: 'Completed' },
                                    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected' }
                                ].map(filterOption => (
                                    <button
                                        key={filterOption.value}
                                        onClick={() => setFilter(filterOption.value)}
                                        className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 ${filter === filterOption.value
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-purple-200 text-purple-600 hover:border-purple-400 hover:bg-purple-50'
                                            }`}
                                    >
                                        {filterOption.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Applications List */}
                    <div className="space-y-6">
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card max-w-md mx-auto">
                                    <div className="text-6xl mb-4">📪</div>
                                    <h3 className="text-xl font-bold text-purple-700 mb-2">No Applications</h3>
                                    <p className="text-purple-600">
                                        {filter === 'all'
                                            ? "You haven't received any applications yet."
                                            : `No ${filter} applications found.`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredApplications.map((application) => {
                                const bounty = bounties[application.bountyId];
                                return (
                                    <div key={application.id} className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-purple-100/50 floating-card">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Applicant Info */}
                                            <div className="flex items-center space-x-4 lg:w-1/3">
                                                <div 
                                                    className="relative w-16 h-16 rounded-full overflow-hidden bg-purple-100 flex-shrink-0 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all duration-200"
                                                    onClick={() => handleViewProfile(application)}
                                                    title="Click to view profile"
                                                >
                                                    {application.applicantProfile ? (
                                                        <Image
                                                            src={application.applicantProfile}
                                                            alt={application.applicantName || 'User'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-purple-600 text-xl font-bold">
                                                            {application.applicantName ? application.applicantName.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 
                                                        className="text-lg font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
                                                        onClick={() => handleViewProfile(application)}
                                                        title="Click to view profile"
                                                    >
                                                        {application.applicantName || 'Unknown User'}
                                                    </h3>
                                                    <p className="text-purple-600">@{application.applicantUsername || 'unknown'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bounty Info */}
                                            <div className="lg:w-1/3">
                                                <h4 className="font-bold text-gray-800 mb-2">{bounty?.title || 'Unknown Bounty'}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{bounty?.description?.substring(0, 100)}...</p>
                                                <p className="text-lg font-bold text-purple-600">
                                                    {bounty ? formatCurrency(bounty.budget) : 'N/A'}
                                                </p>
                                            </div>

                                            {/* Status and Actions */}
                                            <div className="lg:w-1/3 flex flex-col space-y-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)} w-fit`}>
                                                    {getStatusText(application.status)}
                                                </span>

                                                {application.status === APPLICATION_STATUS.PENDING && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAccept(application.id, application.bountyId)}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(application.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {application.status === APPLICATION_STATUS.SUBMITTED && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleReviewWork(application)}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                                                        >
                                                            Review Work
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Work Review Modal */}
            {reviewModalOpen && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-purple-700 mb-6">Review Submitted Work</h2>

                        {/* Applicant Info */}
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                            <h3 className="font-bold text-gray-800 mb-2">Creator: {selectedApplication.applicantName || 'Unknown User'}</h3>
                            <p className="text-purple-600">@{selectedApplication.applicantUsername || 'unknown'}</p>
                            <p className="text-sm text-gray-600">
                                Submitted on {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Bounty Info */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                            <h3 className="font-bold text-gray-800 mb-2">
                                Bounty: {bounties[selectedApplication.bountyId]?.title || 'Unknown Bounty'}
                            </h3>
                            <p className="text-blue-600 font-bold">
                                Budget: {bounties[selectedApplication.bountyId] ? formatCurrency(bounties[selectedApplication.bountyId].budget) : 'N/A'}
                            </p>
                        </div>

                        {/* Submitted Work */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-800 mb-4">Submitted Work:</h3>
                            <div className="p-4 bg-gray-50 rounded-xl border">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                    {selectedApplication.submittedWork || selectedApplication.message || 'No work description provided.'}
                                </p>

                                {selectedApplication.submissionFiles && selectedApplication.submissionFiles.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Attached Files:</h4>
                                        <ul className="space-y-1">
                                            {selectedApplication.submissionFiles.map((file, index) => (
                                                <li key={index} className="text-blue-600 hover:underline cursor-pointer">
                                                    📎 {file.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleRejectWork(selectedApplication.id, selectedApplication.bountyId)}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                            >
                                Reject Work
                            </button>
                            <button
                                onClick={() => handleCompleteWork(selectedApplication.id, selectedApplication.bountyId)}
                                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                            >
                                Accept & Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantsPage;
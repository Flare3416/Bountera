'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardNavbar from '@/components/DashboardNavbar';
import SakuraPetals from '@/components/SakuraPetals';
import { getUserRole } from '@/utils/userData';
import { getApplicationsForUser, submitCompletedWork, APPLICATION_STATUS } from '@/utils/applicationData';
import { getAllBounties, formatCurrency } from '@/utils/bountyData';

const MyApplicationsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [bounties, setBounties] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [submissionModal, setSubmissionModal] = useState({ open: false, applicationId: null });
    const [submissionData, setSubmissionData] = useState({ message: '', files: [] });

    // Check authentication and user role
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        const userRole = getUserRole(session);
        if (userRole !== 'creator') {
            router.push('/dashboard');
            return;
        }

        loadApplications();
    }, [session, status, router]);

    const loadApplications = () => {
        try {
            if (!session?.user?.email) return;

            // Get all applications by this user
            const userApplications = getApplicationsForUser(session.user.email);
            setApplications(userApplications);

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

    const handleSubmitWork = () => {
        if (!submissionData.message.trim()) {
            alert('Please provide a description of your completed work.');
            return;
        }

        const success = submitCompletedWork(submissionModal.applicationId, {
            message: submissionData.message,
            submittedAt: new Date().toISOString(),
            files: submissionData.files
        });

        if (success) {
            setSubmissionModal({ open: false, applicationId: null });
            setSubmissionData({ message: '', files: [] });
            loadApplications();
            alert('Work submitted successfully! The bounty poster will review your submission.');
        } else {
            alert('Failed to submit work. Please try again.');
        }
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
                return 'Accepted - Work in Progress';
            case APPLICATION_STATUS.REJECTED:
                return 'Rejected';
            case APPLICATION_STATUS.COMPLETED:
                return 'Completed - 100 points earned!';
            case APPLICATION_STATUS.SUBMITTED:
                return 'Work Submitted - Awaiting Review';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-pink-600">Loading your applications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 relative overflow-hidden">
            {/* Dashboard Navbar */}
            <DashboardNavbar />

            {/* Sakura Petals Background */}
            <SakuraPetals />

            {/* Main Content */}
            <div className="relative z-10 pt-20 p-6 mt-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center items-center space-x-3">
                            <h1 className="text-5xl leading-none">📋</h1>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent leading-none">
                                My Applications
                            </h1>
                        </div>
                        <p className="text-pink-600 text-lg pt-2 opacity-70">
                            Track your bounty applications and progress
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-8">
                        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
                            <h3 className="text-lg font-bold text-pink-700 mb-4">Filter Applications</h3>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { value: 'all', label: 'All Applications' },
                                    { value: APPLICATION_STATUS.PENDING, label: 'Pending' },
                                    { value: APPLICATION_STATUS.ACCEPTED, label: 'In Progress' },
                                    { value: APPLICATION_STATUS.SUBMITTED, label: 'Under Review' },
                                    { value: APPLICATION_STATUS.COMPLETED, label: 'Completed' },
                                    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected' }
                                ].map(filterOption => (
                                    <button
                                        key={filterOption.value}
                                        onClick={() => setFilter(filterOption.value)}
                                        className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 ${filter === filterOption.value
                                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                                            : 'border-pink-200 text-pink-600 hover:border-pink-400 hover:bg-pink-50'
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
                                <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card max-w-md mx-auto">
                                    <div className="text-6xl mb-4">📪</div>
                                    <h3 className="text-xl font-bold text-pink-700 mb-2">No Applications</h3>
                                    <p className="text-pink-600">
                                        {filter === 'all'
                                            ? "You haven't applied to any bounties yet."
                                            : `No ${filter} applications found.`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredApplications.map((application) => {
                                const bounty = bounties[application.bountyId];
                                return (
                                    <div key={application.id} className="p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Bounty Info */}
                                            <div className="lg:w-2/3">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">{bounty?.title || 'Unknown Bounty'}</h3>
                                                <p className="text-gray-600 mb-4">{bounty?.description}</p>
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <span className="text-2xl font-bold text-pink-600">
                                                        {bounty ? formatCurrency(bounty.budget) : 'N/A'}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status and Actions */}
                                            <div className="lg:w-1/3 flex flex-col space-y-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)} w-fit`}>
                                                    {getStatusText(application.status)}
                                                </span>

                                                {application.status === APPLICATION_STATUS.ACCEPTED && (
                                                    <button
                                                        onClick={() => setSubmissionModal({ open: true, applicationId: application.id })}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                                                    >
                                                        Submit Completed Work
                                                    </button>
                                                )}

                                                {application.status === APPLICATION_STATUS.COMPLETED && (
                                                    <div className="text-green-600 font-medium">
                                                        🎉 You earned 100 points!
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

            {/* Submission Modal */}
            {submissionModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit Completed Work</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Describe your completed work *
                                </label>
                                <textarea
                                    value={submissionData.message}
                                    onChange={(e) => setSubmissionData(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                                    rows={4}
                                    placeholder="Describe what you've completed, provide links to your work, etc."
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleSubmitWork}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                            >
                                Submit Work
                            </button>
                            <button
                                onClick={() => {
                                    setSubmissionModal({ open: false, applicationId: null });
                                    setSubmissionData({ message: '', files: [] });
                                }}
                                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyApplicationsPage;
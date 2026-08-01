"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Loader2,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trophy,
  AlertCircle,
  X,
  User,
  ArrowRight,
  Paperclip,
  Calendar,
  DollarSign,
  Sparkles,
} from "lucide-react";

import BountyPosterNavbar from "@/components/BountyPosterNavbar";
import {
  getApplicationsForPoster,
  acceptApplication,
  rejectApplication,
  completeBounty,
  APPLICATION_STATUS,
  migrateBountiesCreatorFields,
} from "@/utils/applicationData";
import { getAllBounties, formatCurrency } from "@/utils/bountyData";

const ApplicantsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [bounties, setBounties] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const loadApplications = useCallback(() => {
    try {
      if (!session?.user?.email) return;

      migrateBountiesCreatorFields();

      const posterApplications = getApplicationsForPoster(session.user.email);
      setApplications(posterApplications);

      const allBounties = getAllBounties();
      const bountyMap = {};
      allBounties.forEach((bounty) => {
        bountyMap[bounty.id] = bounty;
      });
      setBounties(bountyMap);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const res = await fetch(
          `/api/users/${encodeURIComponent(session.user.email)}`
        );

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const user = await res.json();

        setUserRole(user.role);

        if (user.role !== "POSTER") {
          router.push("/dashboard");
          return;
        }

        loadApplications();
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/login");
      }
    };

    loadUser();
  }, [session, status, router, loadApplications]);

  useEffect(() => {
    const handleApplicationsUpdate = () => {
      loadApplications();
    };

    window.addEventListener("applicationsUpdated", handleApplicationsUpdate);
    return () => {
      window.removeEventListener("applicationsUpdated", handleApplicationsUpdate);
    };
  }, [loadApplications]);

  const handleAccept = async (applicationId, bountyId) => {
    if (
      window.confirm(
        "Are you sure you want to accept this application? This will reject all other applications for this bounty and mark it as in-progress."
      )
    ) {
      const success = acceptApplication(applicationId, bountyId);
      if (success) {
        loadApplications();
        alert(
          "Application accepted successfully! The bounty is now in progress."
        );
      } else {
        alert("Failed to accept application. Please try again.");
      }
    }
  };

  const handleReject = async (applicationId) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      const success = rejectApplication(applicationId);
      if (success) {
        loadApplications();
        alert("Application rejected.");
      } else {
        alert("Failed to reject application. Please try again.");
      }
    }
  };

  const handleReviewWork = (application) => {
    setSelectedApplication(application);
    setReviewModalOpen(true);
  };

  const handleCompleteWork = (applicationId, bountyId) => {
    if (
      window.confirm(
        "Are you sure you want to accept this work and complete the bounty? This will award 100 points to the creator."
      )
    ) {
      const success = completeBounty(applicationId, bountyId, true);
      if (success) {
        loadApplications();
        setReviewModalOpen(false);
        alert(
          "Work accepted! Bounty completed and 100 points awarded to the creator."
        );
      } else {
        alert("Failed to complete bounty. Please try again.");
      }
    }
  };

  const handleRejectWork = (applicationId, bountyId) => {
    if (
      window.confirm(
        "Are you sure you want to reject this work? This will cancel the bounty."
      )
    ) {
      const success = completeBounty(applicationId, bountyId, false);
      if (success) {
        loadApplications();
        setReviewModalOpen(false);
        alert("Work rejected. Bounty has been cancelled.");
      } else {
        alert("Failed to reject work. Please try again.");
      }
    }
  };

  const handleViewProfile = (application) => {
    const username =
      application.applicantUsername ||
      application.applicantEmail?.split("@")[0] ||
      "unknown";
    router.push(`/profile/${username}`);
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return "border-amber-500/20 bg-amber-500/10 text-amber-200";
      case APPLICATION_STATUS.ACCEPTED:
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
      case APPLICATION_STATUS.REJECTED:
        return "border-red-500/20 bg-red-500/10 text-red-200";
      case APPLICATION_STATUS.COMPLETED:
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-200";
      case APPLICATION_STATUS.SUBMITTED:
        return "border-violet-500/20 bg-violet-500/10 text-violet-200";
      default:
        return "border-white/10 bg-white/5 text-slate-300";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return "Pending Review";
      case APPLICATION_STATUS.ACCEPTED:
        return "Accepted";
      case APPLICATION_STATUS.REJECTED:
        return "Rejected";
      case APPLICATION_STATUS.COMPLETED:
        return "Completed";
      case APPLICATION_STATUS.SUBMITTED:
        return "Work Submitted";
      default:
        return status;
    }
  };

  const filterOptions = [
    { value: "all", label: "All Applications", icon: ClipboardList },
    { value: APPLICATION_STATUS.PENDING, label: "Pending", icon: Clock },
    { value: APPLICATION_STATUS.ACCEPTED, label: "Accepted", icon: CheckCircle2 },
    { value: APPLICATION_STATUS.SUBMITTED, label: "Work Submitted", icon: Send },
    { value: APPLICATION_STATUS.COMPLETED, label: "Completed", icon: Trophy },
    { value: APPLICATION_STATUS.REJECTED, label: "Rejected", icon: XCircle },
  ];

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Applications</h2>
          <p className="mt-2 text-sm text-slate-400">Fetching submissions...</p>
        </div>
      </div>
    );
  }
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[160px]" />

      <BountyPosterNavbar />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur">
            <ClipboardList className="h-3.5 w-3.5" />
            Review Submissions
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Applications{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Manager
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Review, accept, and manage applications for your posted bounties.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-violet-300" />
            <h3 className="text-lg font-semibold text-white">
              Filter Applications
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,.1)]"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
                {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <ClipboardList className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                No Applications
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                {filter === "all"
                  ? "You haven't received any applications yet."
                  : `No ${filter} applications found.`}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => {
              const bounty = bounties[application.bountyId];
              return (
                <div
                  key={application.id}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] sm:p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* Applicant Info */}
                    <div className="flex items-center gap-4 lg:w-1/3">
                      <div
                        className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/[0.05] transition hover:ring-2 hover:ring-violet-400/50"
                        onClick={() => handleViewProfile(application)}
                        title="Click to view profile"
                      >
                        {application.applicantProfile ? (
                          <Image
                            src={application.applicantProfile}
                            alt={application.applicantName || "User"}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-violet-200">
                            {application.applicantName
                              ? application.applicantName
                                  .charAt(0)
                                  .toUpperCase()
                              : "?"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="cursor-pointer text-sm font-bold text-white transition-colors hover:text-violet-300"
                          onClick={() => handleViewProfile(application)}
                          title="Click to view profile"
                        >
                          {application.applicantName || "Unknown User"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          @{application.applicantUsername || "unknown"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Bounty Info */}
                    <div className="lg:w-1/3">
                      <h4 className="text-sm font-semibold text-white">
                        {bounty?.title || "Unknown Bounty"}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {bounty?.description?.substring(0, 100)}...
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-sm font-bold text-violet-300">
                        <DollarSign className="h-3.5 w-3.5" />
                        {bounty ? formatCurrency(bounty.budget) : "N/A"}
                      </p>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                          application.status
                        )}`}
                      >
                        {getStatusText(application.status)}
                      </span>

                      {application.status === APPLICATION_STATUS.PENDING && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleAccept(application.id, application.bountyId)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,.35)]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(application.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}

                      {application.status === APPLICATION_STATUS.SUBMITTED && (
                        <button
                          onClick={() => handleReviewWork(application)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,.35)]"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Review Work
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
            {/* Work Review Modal */}
      {reviewModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">
                  Review Submitted Work
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Evaluate the creator&apos;s submission before completing the
                  bounty.
                </p>
              </div>

              {/* Applicant Info */}
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                    <User className="h-5 w-5 text-violet-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {selectedApplication.applicantName || "Unknown User"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      @{selectedApplication.applicantUsername || "unknown"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Submitted on{" "}
                  {new Date(
                    selectedApplication.submittedAt
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* Bounty Info */}
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-sm font-semibold text-white">
                  {bounties[selectedApplication.bountyId]?.title ||
                    "Unknown Bounty"}
                </h3>
                <p className="mt-1 text-sm font-bold text-violet-300">
                  {bounties[selectedApplication.bountyId]
                    ? formatCurrency(
                        bounties[selectedApplication.bountyId].budget
                      )
                    : "N/A"}
                </p>
              </div>

              {/* Submitted Work */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-white">
                  Submitted Work
                </h3>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {selectedApplication.submittedWork ||
                      selectedApplication.message ||
                      "No work description provided."}
                  </p>

                  {selectedApplication.submissionFiles &&
                    selectedApplication.submissionFiles.length > 0 && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Paperclip className="h-3.5 w-3.5" />
                          Attached Files
                        </h4>
                        <ul className="space-y-1.5">
                          {selectedApplication.submissionFiles.map(
                            (file, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-1.5 text-xs text-cyan-300 transition hover:text-cyan-200"
                              >
                                <Paperclip className="h-3 w-3" />
                                {file.name}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    handleRejectWork(
                      selectedApplication.id,
                      selectedApplication.bountyId
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Work
                </button>
                <button
                  onClick={() =>
                    handleCompleteWork(
                      selectedApplication.id,
                      selectedApplication.bountyId
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,.35)]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Loader2,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trophy,
  AlertCircle,
  X,
  ArrowLeft,
  Sparkles,
  Briefcase,
} from "lucide-react";

import BountyHunterNavbar from "@/components/BountyHunterNavbar";
import {
  getApplicationsForUser,
  submitCompletedWork,
  APPLICATION_STATUS,
} from "@/utils/applicationData";
import { getAllBounties, formatCurrency } from "@/utils/bountyData";

const MyApplicationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [bounties, setBounties] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [submissionModal, setSubmissionModal] = useState({
    open: false,
    applicationId: null,
  });
  const [submissionData, setSubmissionData] = useState({
    message: "",
    files: [],
  });
  const [userRole, setUserRole] = useState(null);
  const loadApplications = useCallback(() => {
    try {
      if (!session?.user?.email) return;

      const userApplications = getApplicationsForUser(session.user.email);
      setApplications(userApplications);

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

        if (user.role !== "HUNTER") {
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

  const handleSubmitWork = () => {
    if (!submissionData.message.trim()) {
      alert("Please provide a description of your completed work.");
      return;
    }

    const success = submitCompletedWork(submissionModal.applicationId, {
      message: submissionData.message,
      submittedAt: new Date().toISOString(),
      files: submissionData.files,
    });

    if (success) {
      setSubmissionModal({ open: false, applicationId: null });
      setSubmissionData({ message: "", files: [] });
      loadApplications();
      alert(
        "Work submitted successfully! The bounty poster will review your submission."
      );
    } else {
      alert("Failed to submit work. Please try again.");
    }
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
        return "Accepted — In Progress";
      case APPLICATION_STATUS.REJECTED:
        return "Rejected";
      case APPLICATION_STATUS.COMPLETED:
        return "Completed — 100 pts earned";
      case APPLICATION_STATUS.SUBMITTED:
        return "Submitted — Awaiting Review";
      default:
        return status;
    }
  };

  const filterOptions = [
    { value: "all", label: "All", icon: FileText },
    { value: APPLICATION_STATUS.PENDING, label: "Pending", icon: Clock },
    { value: APPLICATION_STATUS.ACCEPTED, label: "In Progress", icon: Briefcase },
    { value: APPLICATION_STATUS.SUBMITTED, label: "Under Review", icon: Send },
    { value: APPLICATION_STATUS.COMPLETED, label: "Completed", icon: CheckCircle2 },
    { value: APPLICATION_STATUS.REJECTED, label: "Rejected", icon: XCircle },
  ];

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Applications</h2>
          <p className="mt-2 text-sm text-slate-400">Fetching your bounty applications...</p>
        </div>
      </div>
    );
  }
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[160px]" />

      <BountyHunterNavbar />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur">
            <FileText className="h-3.5 w-3.5" />
            Application Tracker
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            My{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Applications
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Track your bounty applications and progress
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-white">Filter by Status</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,.1)]"
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
                <FileText className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                No Applications
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                {filter === "all"
                  ? "You haven't applied to any bounties yet."
                  : `No ${filter} applications found.`}
              </p>
              <button
                onClick={() => router.push("/bounties")}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,.35)]"
              >
                <Sparkles className="h-4 w-4" />
                Find Bounties
              </button>
            </div>
          ) : (
            filteredApplications.map((application) => {
              const bounty = bounties[application.bountyId];
              return (
                <div
                  key={application.id}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Bounty Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white">
                        {bounty?.title || "Unknown Bounty"}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {bounty?.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <span className="text-lg font-black text-white">
                          {bounty ? formatCurrency(bounty.budget) : "N/A"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                          application.status
                        )}`}
                      >
                        {getStatusText(application.status)}
                      </span>

                      {application.status === APPLICATION_STATUS.ACCEPTED && (
                        <button
                          onClick={() =>
                            setSubmissionModal({
                              open: true,
                              applicationId: application.id,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,.35)]"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Submit Work
                        </button>
                      )}

                      {application.status === APPLICATION_STATUS.COMPLETED && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                          <Trophy className="h-3.5 w-3.5" />
                          You earned 100 points!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
              </main>

      {/* Submission Modal */}
      {submissionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => {
                setSubmissionModal({ open: false, applicationId: null });
                setSubmissionData({ message: "", files: [] });
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">
                  Submit Completed Work
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Describe what you&apos;ve completed and provide any relevant
                  links.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Work Description *
                  </label>
                  <textarea
                    value={submissionData.message}
                    onChange={(e) =>
                      setSubmissionData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="h-32 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
                    placeholder="Describe what you've completed, provide links to your work, etc."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setSubmissionModal({ open: false, applicationId: null });
                    setSubmissionData({ message: "", files: [] });
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitWork}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,.35)]"
                >
                  Submit Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Briefcase,
  Search,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Clock,
  AlertCircle,
  Frown,
  ClipboardList,
  ArrowRight,
  PlusCircle,
  Filter,
  XCircle,
} from "lucide-react";

import BountyPosterNavbar from "@/components/BountyPosterNavbar";
import BountyCard from "@/components/BountyCard";
import BountyModal from "@/components/BountyModal";
import {
  BOUNTY_CATEGORIES,
  DIFFICULTY_LEVELS,
} from "@/utils/bountyConstants";

  // Access denied states
  const AccessDenied = () => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-[150px]" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-[140px]" />

      <div className="relative z-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-400">
          This page is only for bounty posters
        </p>
        <button
          onClick={() => router.push("/bounties")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,.35)]"
        >
          Go to Bounties
        </button>
      </div>
    </div>
  );

const MyBounties = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email;
  const sessionRole = session?.user?.role;
  const [myBounties, setMyBounties] = useState([]);
  const [filteredBounties, setFilteredBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    search: "",
    status: "OPEN",
  });

  const [selectedBounty, setSelectedBounty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!userEmail) {
      router.push("/login");
      return;
    }

    setUserRole(sessionRole || null);

    if (sessionRole !== "POSTER") {
      router.push("/bounties");
      return;
    }
  }, [userEmail, sessionRole, status, router]);

  useEffect(() => {
    if (!userEmail || userRole !== "POSTER") return;

    const loadBounties = async () => {
      try {
        const res = await fetch("/api/bounties");

        if (!res.ok) {
          throw new Error("Failed to fetch bounties");
        }

        const allBounties = await res.json();

        const userBounties = allBounties.filter(
          (bounty) => bounty.poster.email === userEmail
        );

        setMyBounties(userBounties);
        setFilteredBounties(userBounties);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBounties();
  }, [userEmail, userRole]);

  useEffect(() => {
    let filtered = myBounties;

    if (filters.category !== "all") {
      filtered = filtered.filter((bounty) =>
        bounty.categories?.includes(filters.category)
      );
    }
    if (filters.difficulty !== "all") {
      filtered = filtered.filter(
        (bounty) => bounty.difficulty === filters.difficulty
      );
    }
    if (filters.status === "EXPIRED") {
      filtered = filtered.filter((bounty) => {
        const isExpired = new Date(bounty.deadline) < new Date();
        return isExpired;
      });
    } else if (filters.status === "OPEN") {
      filtered = filtered.filter((bounty) => {
        const isExpired = new Date(bounty.deadline) < new Date();
        return bounty.status === "OPEN" && !isExpired;
      });
    } else {
      if (filters.status === "COMPLETED") {
        filtered = filtered.filter(
          (bounty) => bounty.status === filters.status
        );
      } else {
        filtered = filtered.filter((bounty) => {
          const isExpired = new Date(bounty.deadline) < new Date();
          return bounty.status === filters.status && !isExpired;
        });
      }
    }
    if (filters.search) {
      filtered = filtered.filter((bounty) => {
        const query = filters.search.toLowerCase();

        return (
          bounty.title?.toLowerCase().includes(query) ||
          bounty.description?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredBounties(filtered);
  }, [myBounties, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleEditBounty = (bountyId) => {
    router.push(`/create-bounty?edit=${bountyId}`);
  };

  const handleDeleteBounty = async (bountyId) => {
    if (!window.confirm("Are you sure you want to delete this bounty?")) {
      return;
    }

    try {

      const response = await fetch(`/api/bounties/${bountyId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete bounty");
      }

      const res = await fetch("/api/bounties");

      if (!res.ok) {
        throw new Error("Failed to reload bounties");
      }

      const refreshed = await res.json();

      const userBounties = refreshed.filter(
        (bounty) => bounty.poster.email === userEmail
      );

      setMyBounties(userBounties);
      setFilteredBounties(userBounties);

      alert("Bounty deleted successfully!");
    } catch (error) {
      console.error("Error deleting bounty:", error);
      alert("Failed to delete bounty.");
    }
  };

  const handleUpdateBountyStatus = async (bountyId, newStatus) => {
    const statusNames = {
      OPEN: "Open",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      EXPIRED: "Expired",
    };

    if (
      !window.confirm(
        `Are you sure you want to change this bounty status to "${statusNames[newStatus]}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/bounties/${bountyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const bountyToUpdate = await response.json();

      if (!response.ok) {
        throw new Error(
          bountyToUpdate.error || "Failed to update bounty status"
        );
      }

      const res = await fetch("/api/bounties");

      if (!res.ok) {
        throw new Error("Failed to reload bounties");
      }

      const refreshed = await res.json();

      const userBounties = refreshed.filter(
        (bounty) => bounty.poster.email === userEmail
      );

      setMyBounties(userBounties);
      setFilteredBounties(userBounties);

      alert(
        `Bounty status updated to "${statusNames[newStatus]}" successfully!`
      );
    } catch (error) {
      console.error("Error updating bounty status:", error);
      alert("Failed to update bounty status.");
    }
  };

  const handleApplyToBounty = (bountyId) => {
    router.push(`/bounty-application/${bountyId}`);
  };

  const handleViewDetails = (bounty) => {
    setSelectedBounty(bounty);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBounty(null);
  };

  // Loading state
  if (status === "loading" || (session && userRole === null)) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading</h2>
          <p className="mt-2 text-sm text-slate-400">Please wait...</p>
        </div>
      </div>
    );
  }

  if (userRole && userRole !== "POSTER") return <AccessDenied />;
  if (userRole === "HUNTER") return <AccessDenied />;
  if (session && userRole && userRole !== "POSTER") return <AccessDenied />;
  if (!session) return null;

  const activeCount = myBounties.filter((b) => {
    const isExpired = new Date(b.deadline) < new Date();
    return b.status === "OPEN" && !isExpired;
  }).length;

  const expiredCount = myBounties.filter((b) => {
    return new Date(b.deadline) < new Date();
  }).length;
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[160px]" />

      <BountyPosterNavbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur">
            <Briefcase className="h-3.5 w-3.5" />
            Bounty Poster Dashboard
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            My Created{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Bounties
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Manage and track all the bounties you&apos;ve created.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-violet-300" />
            <h3 className="text-lg font-semibold text-white">Filter Bounties</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Search className="h-3 w-3" />
                  Search
                </span>
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search bounties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="all" className="bg-slate-900 text-slate-400">
                    All Categories
                  </option>
                  {BOUNTY_CATEGORIES.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-slate-900 text-white"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Difficulty
              </label>
              <div className="relative">
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="all" className="bg-slate-900 text-slate-400">
                    All Levels
                  </option>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option
                      key={level.id}
                      value={level.id}
                      className="bg-slate-900 text-white"
                    >
                      {level.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Status
              </label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="OPEN" className="bg-slate-900 text-white">
                    Open
                  </option>
                  <option value="COMPLETED"className="bg-slate-900 text-white">
                    Completed
                  </option>
                  <option value="CANCELLED" className="bg-slate-900 text-white">
                    Cancelled
                  </option>
                  <option value="EXPIRED" className="bg-slate-900 text-white">
                    Expired
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredBounties.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {myBounties.length}
            </span>{" "}
            bounties
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur-xl">
            <div className="mb-1 text-3xl font-black text-white">
              {myBounties.length}
            </div>
            <div className="text-xs font-medium text-slate-400">
              Total Created
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6 text-center shadow-xl backdrop-blur-xl">
            <div className="mb-1 text-3xl font-black text-emerald-300">
              {activeCount}
            </div>
            <div className="text-xs font-medium text-emerald-400/60">
              Active
            </div>
          </div>
          <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center shadow-xl backdrop-blur-xl">
            <div className="mb-1 text-3xl font-black text-red-300">
              {expiredCount}
            </div>
            <div className="text-xs font-medium text-red-400/60">
              Expired
            </div>
          </div>
        </div>
                {/* Bounties Grid */}
        {filteredBounties.length > 0 && session?.user?.email ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBounties.map((bounty) => {
              const safeOnEdit =
                typeof handleEditBounty === "function"
                  ? handleEditBounty
                  : () => {};
              const safeOnDelete =
                typeof handleDeleteBounty === "function"
                  ? handleDeleteBounty
                  : () => {};
              const safeOnApply =
                typeof handleApplyToBounty === "function"
                  ? (id) => handleApplyToBounty(id)
                  : () => {};

              return (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  isOwner={
                    userRole === "POSTER" &&
                    session?.user?.email &&
                    bounty.poster?.email === session.user.email
                  }
                  userRole={userRole}
                  onEdit={safeOnEdit}
                  onDelete={safeOnDelete}
                  onUpdateStatus={handleUpdateBountyStatus}
                  onApply={() => safeOnApply(bounty.id)}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
          </div>
        ) : filteredBounties.length > 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Loading...</h3>
            <p className="mt-2 text-sm text-slate-400">
              Setting up your dashboard...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
            {myBounties.length === 0 ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <ClipboardList className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  No Bounties Yet
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                  Start by creating your first bounty to connect with talented
                  hunters.
                </p>
                <button
                  onClick={() => router.push("/create-bounty")}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,.35)]"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create First Bounty
                </button>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <Frown className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  No Bounties Match Your Filters
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                  Try adjusting your filters or search terms to find what
                  you&apos;re looking for.
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      category: "all",
                      difficulty: "all",
                      status: "OPEN",
                      search: "",
                    });
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Clear All Filters
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Bounty Modal */}
      {isModalOpen && selectedBounty && (
        <BountyModal
          bounty={selectedBounty}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userRole={userRole}
          onApply={undefined}
        />
      )}
    </div>
  );
};

export default MyBounties;
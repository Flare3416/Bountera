"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Target,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Frown,
} from "lucide-react";

import BountyHunterNavbar from "@/components/BountyHunterNavbar";
import BountyPosterNavbar from "@/components/BountyPosterNavbar";
import BountyCard from "@/components/BountyCard";
import BountyModal from "@/components/BountyModal";
import {
  getAllBounties,
  filterBountiesByCategory,
  filterBountiesByDifficulty,
  searchBounties,
  BOUNTY_CATEGORIES,
  DIFFICULTY_LEVELS,
  updateExpiredBounties,
  getBountyExpirationInfo,
} from "@/utils/bountyData";
import { migrateBountiesCreatorFields } from "@/utils/applicationData";

const Bounties = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allBounties, setAllBounties] = useState([]);
  const [filteredBounties, setFilteredBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    search: "",
  });

  // Function to load bounties
  const loadBounties = useCallback(() => {
    migrateBountiesCreatorFields();
    const allBountiesData = updateExpiredBounties();

    const activeBounties = allBountiesData.filter((bounty) => {
      const { isExpired } = getBountyExpirationInfo(bounty.deadline);
      const isAvailable = bounty.status === "open" || !bounty.status;
      return !isExpired && isAvailable;
    });

    setAllBounties(activeBounties);
    setFilteredBounties(activeBounties);
    setLoading(false);
  }, []);

  // Check authentication and user role
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
        loadBounties();
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/login");
      }
    };

    loadUser();
  }, [session, status, router, loadBounties]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (
        e.key === "bountera_all_bounties" ||
        e.key === "bountera_applications"
      ) {
        loadBounties();
      }
    };

    const handleCustomUpdate = () => {
      loadBounties();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bountyStatusUpdated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bountyStatusUpdated", handleCustomUpdate);
    };
  }, [loadBounties]);

  // Apply filters
  useEffect(() => {
    let filtered = allBounties;
    filtered = filterBountiesByCategory(filtered, filters.category);
    filtered = filterBountiesByDifficulty(filtered, filters.difficulty);
    filtered = searchBounties(filtered, filters.search);
    setFilteredBounties(filtered);
  }, [allBounties, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleApplyToBounty = (bounty) => {
    alert(`Application feature coming soon for: ${bounty.title}`);
  };

  const handleViewDetails = (bounty) => {
    setSelectedBounty(bounty);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBounty(null);
  };

  if (status === "loading" || (session && userRole === null)) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Bounties</h2>
          <p className="mt-2 text-sm text-slate-400">Fetching opportunities...</p>
        </div>
      </div>
    );
  }
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[160px]" />

      {/* Navbar */}
      {userRole === "POSTER" ? (
        <BountyPosterNavbar />
      ) : (
        <BountyHunterNavbar />
      )}

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur">
            <Target className="h-3.5 w-3.5" />
            Discover Opportunities
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Available{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Bounties
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Find exciting challenges that match your skills and start earning.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">Filter Bounties</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
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

            {/* Difficulty Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Difficulty
              </label>
              <div className="relative">
                <select
                  value={filters.difficulty}
                  onChange={(e) =>
                    handleFilterChange("difficulty", e.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
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
              {allBounties.length}
            </span>{" "}
            bounties
          </div>
        </div>
                {/* Bounties Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Loading Bounties</h3>
              <p className="mt-2 text-sm text-slate-400">
                Fetching the latest opportunities...
              </p>
            </div>
          ) : filteredBounties.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                {allBounties.length === 0 ? (
                  <Sparkles className="h-8 w-8 text-slate-600" />
                ) : (
                  <Frown className="h-8 w-8 text-slate-600" />
                )}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                {allBounties.length === 0
                  ? "No Bounties Available"
                  : "No Bounties Found"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                {allBounties.length === 0
                  ? "Check back soon for exciting opportunities!"
                  : "Try adjusting your filters to find more bounties."}
              </p>

              {allBounties.length === 0 &&
                userRole === "POSTER" && (
                  <button
                    onClick={() => router.push("/create-bounty")}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,.35)]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Be the First to Post a Bounty!
                  </button>
                )}

              {allBounties.length > 0 && (
                <button
                  onClick={() =>
                    setFilters({ category: "all", difficulty: "all", search: "" })
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Clear Filters
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBounties.map((bounty) => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  isOwner={false}
                  userRole={userRole}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bounty Modal */}
      {isModalOpen && selectedBounty && (
        <BountyModal
          bounty={selectedBounty}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userRole={userRole}
          onApply={userRole === "HUNTER" ? handleApplyToBounty : undefined}
        />
      )}
    </div>
  );
};

export default Bounties;
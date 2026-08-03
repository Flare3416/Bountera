"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Briefcase,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Target,
  Pencil,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import BountyCard from "@/components/BountyCard";
import {getBountyExpirationInfo,} from "@/utils/bountyHelpers";
import { ACTIVITY_TYPES } from "@/utils/activityData";
import { apiGet, apiInvalidate } from "@/lib/apiClient";

const BountyPosterDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userBounties, setUserBounties] = useState([]);
  const [allUserBounties, setAllUserBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeBounties: 0,
    completedBounties: 0,
    totalApplications: 0,
    totalSpent: 0,
  });

  const computeStats = (bounties) => {
    const totalBounties = bounties.length;

    const openActiveBounties = bounties.filter((bounty) => {
      const { isExpired } = getBountyExpirationInfo(bounty.deadline);
      return bounty.status === "OPEN" && !isExpired;
    }).length;

    const completedBounties = bounties.filter(
      (bounty) => bounty.status === "COMPLETED"
    ).length;

    const totalApplications = bounties.reduce(
      (sum, bounty) => sum + (bounty.applications?.length || 0),
      0
    );

    const totalSpent = bounties
      .filter((bounty) => bounty.status === "COMPLETED")
      .reduce((sum, bounty) => {
        const budget = Number(bounty.budget) || 0;
        return sum + budget;
      }, 0);

    setStats({
      totalBounties,
      activeBounties: openActiveBounties,
      completedBounties,
      totalApplications,
      totalSpent,
    });
  };

  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    const loadBounties = async () => {
      try {
        const allBounties = await apiGet(
          `/api/bounties?posterEmail=${encodeURIComponent(userEmail)}`
        );

        const bounties = allBounties.filter((bounty) => {
          const { isExpired } = getBountyExpirationInfo(bounty.deadline);
          return (
            !isExpired ||
            ["COMPLETED", "CANCELLED"].includes(bounty.status)
          );
        });

        setUserBounties(bounties);
        setAllUserBounties(allBounties);
        computeStats(allBounties);
      } catch (error) {
        console.error("Failed to load bounties:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBounties();
  }, [session?.user?.email]);

  const handleEditBounty = (bountyId) => {
    router.push(`/create-bounty?edit=${bountyId}`);
  };

  const handleDeleteBounty = async (bountyId) => {
    if (!window.confirm("Are you sure you want to delete this bounty?")) {
      return;
    }

    try {
      const bountyToDelete = userBounties.find((b) => b.id === bountyId);

      const response = await fetch(`/api/bounties/${bountyId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete bounty");
      }

      apiInvalidate("/api/bounties");

      if (bountyToDelete) {
        const activityRes = await fetch("/api/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            type: ACTIVITY_TYPES.BOUNTY_DELETED,
            data: {
              bountyTitle: bountyToDelete.title,
              bountyId,
            },
          }),
        });

        if (!activityRes.ok) {
          console.error("Failed to log activity");
        }
      }

      const remaining = userBounties.filter((b) => b.id !== bountyId);
      const remainingAll = allUserBounties.filter((b) => b.id !== bountyId);

      setUserBounties(remaining);
      setAllUserBounties(remainingAll);
      computeStats(remainingAll);

      alert("Bounty deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete bounty.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Dashboard</h2>
          <p className="mt-2 text-sm text-slate-400">
            Fetching your bounties...
          </p>
        </div>
      </div>
    );
  }

const userData = session?.user || null;
const userDisplayName = session?.user?.name || "Business";
const userProfileImage = session?.user?.profileImage || session?.user?.image || null;
const userBackgroundImage = session?.user?.backgroundImage || null;

  const statCards = [
    {
      label: "Total Bounties",
      value: stats.totalBounties,
      icon: Briefcase,
      tone: "text-cyan-300",
      bg: "from-cyan-500/10 to-cyan-500/5",
    },
    {
      label: "Active",
      value: stats.activeBounties,
      icon: Clock,
      tone: "text-violet-300",
      bg: "from-violet-500/10 to-violet-500/5",
    },
    {
      label: "Completed",
      value: stats.completedBounties,
      icon: CheckCircle2,
      tone: "text-emerald-300",
      bg: "from-emerald-500/10 to-emerald-500/5",
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      icon: Users,
      tone: "text-amber-300",
      bg: "from-amber-500/10 to-amber-500/5",
    },
    {
      label: "Total Spent",
      value: `$${(Number(stats.totalSpent) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      tone: "text-rose-300",
      bg: "from-rose-500/10 to-rose-500/5",
    },
  ];

  const quickActions = [
    {
      title: "Post New Bounty",
      desc: "Create a project and find talented creators",
      icon: PlusCircle,
      href: "/create-bounty",
      gradient: "from-cyan-500 to-violet-600",
    },
    {
      title: "Manage Bounties",
      desc: "View and edit your ongoing projects",
      icon: Briefcase,
      href: "/my-bounties",
      gradient: "from-violet-500 to-fuchsia-600",
    },
    {
      title: "Review Applications",
      desc: "Check applicants for your bounties",
      icon: Users,
      href: "/applicants",
      gradient: "from-emerald-500 to-cyan-600",
    },
  ];
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[160px]" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Profile Banner */}
        {userData && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="relative h-48 w-full overflow-hidden sm:h-56">
              <Image
                src={userBackgroundImage || "/defaultbanner.jpeg"}
                alt="Banner"
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            </div>

            <div className="relative -mt-12 flex flex-col gap-4 px-6 pb-6 sm:-mt-14 sm:flex-row sm:items-end sm:px-8 sm:pb-8">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 bg-slate-900 shadow-xl sm:h-28 sm:w-28">
                <Image
                  src={userProfileImage || "/defaultpfp.jpg"}
                  alt="Profile"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {userData.name || userDisplayName}
                </h1>
                {userData.companyName && (
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-400">
                    {userData.companyName}
                  </p>
                )}
                {userData.bio && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                    {userData.bio}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => router.push("/bounty-poster-setup")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Bounty Poster Dashboard
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {userDisplayName}
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Manage your bounties, review applications, and find the best
            creators for your projects.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div
                  className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.bg} blur-2xl transition-opacity group-hover:opacity-100 opacity-50`}
                />
                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                    <Icon className={`h-4 w-4 ${stat.tone}`} />
                  </div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
                {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => router.push(action.href)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-violet-500/5 sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                  {action.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {action.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Recent Bounties */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-semibold text-white">
                Recent Bounties
              </h2>
            </div>
            <Link
              href="/create-bounty"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,.35)]"
            >
              <PlusCircle className="h-4 w-4" />
              New Bounty
            </Link>
          </div>

          {userBounties.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <Target className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                No bounties yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                Create your first bounty to start finding talented creators for
                your projects.
              </p>
              <Link
                href="/create-bounty"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,.35)]"
              >
                <PlusCircle className="h-4 w-4" />
                Create Your First Bounty
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userBounties.slice(0, 6).map((bounty) => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    isOwner={true}
                    userRole="POSTER"
                    onEdit={handleEditBounty}
                    onDelete={handleDeleteBounty}
                  />
                ))}
              </div>

              {userBounties.length > 6 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => router.push("/my-bounties")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View All Bounties
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BountyPosterDashboard;
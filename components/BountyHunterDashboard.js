"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Trophy,
  Star,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  Loader2,
  Sparkles,
  User,
  Pencil,
  ExternalLink,
} from "lucide-react";

import {
  getUserDisplayName,
  getUserProfileImage,
  getUserBackgroundImage,
  getAllUserData,
  getUserData,
} from "@/utils/userData";
import { getApplicationsForUser } from "@/utils/applicationData";
import {
  getUserPoints,
  getUserRank,
  awardDailyLoginPoints,
  migrateExistingDataPoints,
} from "@/utils/pointsSystem";

const BountyHunterDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userBackgroundImage = getUserBackgroundImage(session);
  const userDisplayName = getUserDisplayName(session);
  const userProfileImage = getUserProfileImage(session);
  const userData = getAllUserData(session);

  const [userStats, setUserStats] = useState({
    applications: { active: 0, completed: 0, pending: 0, accepted: 0 },
    points: 0,
    rank: null,
    totalBounties: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadStats = () => {
      if (session?.user?.email) {
        migrateExistingDataPoints();
        awardDailyLoginPoints(session.user.email);

        setTimeout(() => {
          const applications = getApplicationsForUser(session.user.email);
          const activeApplications = applications.filter(
            (app) => app.status === "pending" || app.status === "accepted"
          ).length;
          const completedApplications = applications.filter(
            (app) => app.status === "completed"
          ).length;
          const pendingApplications = applications.filter(
            (app) => app.status === "pending"
          ).length;
          const acceptedApplications = applications.filter(
            (app) => app.status === "accepted"
          ).length;

          const points = getUserPoints(session.user.email);
          const rank = getUserRank(session.user.email);

          setUserStats({
            applications: {
              active: activeApplications,
              completed: completedApplications,
              pending: pendingApplications,
              accepted: acceptedApplications,
            },
            points,
            rank,
            totalBounties: applications.length,
          });
        }, 100);
      }
    };

    loadStats();
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      const activities = [
        {
          id: 1,
          type: "login",
          message: "Daily login bonus earned",
          time: "2 hours ago",
          icon: Zap,
          tone: "text-amber-300",
          bg: "from-amber-500/10 to-amber-500/5",
        },
        {
          id: 2,
          type: "application",
          message: 'Applied to "Web Design Project"',
          time: "1 day ago",
          icon: FileText,
          tone: "text-cyan-300",
          bg: "from-cyan-500/10 to-cyan-500/5",
        },
        {
          id: 3,
          type: "points",
          message: "Earned 50 points for completing bounty",
          time: "3 days ago",
          icon: Star,
          tone: "text-violet-300",
          bg: "from-violet-500/10 to-violet-500/5",
        },
      ];
      setRecentActivity(activities);
    }
  }, [session?.user?.email]);

  if (status === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Dashboard</h2>
          <p className="mt-2 text-sm text-slate-400">
            Fetching your creator stats...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const statCards = [
    {
      label: "Active Applications",
      value: userStats.applications.active,
      icon: Clock,
      tone: "text-cyan-300",
      bg: "from-cyan-500/10 to-cyan-500/5",
    },
    {
      label: "Total Applications",
      value: userStats.totalBounties,
      icon: FileText,
      tone: "text-violet-300",
      bg: "from-violet-500/10 to-violet-500/5",
    },
    {
      label: "Total Points",
      value: userStats.points,
      icon: Star,
      tone: "text-amber-300",
      bg: "from-amber-500/10 to-amber-500/5",
    },
    {
      label: "Global Rank",
      value: userStats.rank ? `#${userStats.rank}` : "--",
      icon: Trophy,
      tone: "text-emerald-300",
      bg: "from-emerald-500/10 to-emerald-500/5",
    },
  ];

  const quickActions = [
    {
      title: "Find Bounties",
      desc: "Discover projects that match your skills",
      icon: Search,
      href: "/bounties",
      gradient: "from-cyan-500 to-violet-600",
    },
    {
      title: "My Applications",
      desc: `${userStats.applications.pending} pending · ${userStats.applications.completed} completed`,
      icon: FileText,
      href: "/my-applications",
      gradient: "from-violet-500 to-fuchsia-600",
    },
    {
      title: "Leaderboard",
      desc: `Rank #${userStats.rank || "--"} · ${userStats.points} points`,
      icon: Trophy,
      href: "/leaderboard",
      gradient: "from-emerald-500 to-cyan-600",
    },
  ];
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[160px]" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Profile Banner */}
        {userData && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="relative h-48 w-full overflow-hidden sm:h-56">
              {userData.bannerImage || userBackgroundImage ? (
                <Image
                  src={userData.bannerImage || userBackgroundImage}
                  alt="Banner"
                  fill
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover"
                  priority
                />
              ) : (
                <Image
                  src="/defaultbanner.jpeg"
                  alt="Default banner"
                  fill
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            </div>

            <div className="relative -mt-12 flex flex-col gap-4 px-6 pb-6 sm:-mt-14 sm:flex-row sm:items-end sm:px-8 sm:pb-8">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 bg-slate-900 shadow-xl sm:h-28 sm:w-28">
                {userProfileImage || userData.profileImage ? (
                  <Image
                    src={userProfileImage || userData.profileImage}
                    alt="Profile"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/defaultpfp.jpg"
                    alt="Default profile"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {userData.name || userDisplayName}
                </h1>

                {userData?.skills && userData.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {userData.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-200"
                      >
                        {skill.length > 18
                          ? skill.substring(0, 18) + "..."
                          : skill}
                      </span>
                    ))}
                    {userData.skills.length > 3 && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                        +{userData.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    const currentUserData = getUserData(session?.user?.email);
                    if (currentUserData && currentUserData.username) {
                      router.push(`/profile/${currentUserData.username}`);
                    } else {
                      router.push("/profile-setup");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Profile
                </button>
                <button
                  onClick={() => router.push("/profile-setup")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,.35)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Creator Dashboard
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              {userDisplayName}
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Discover bounties, track your applications, and climb the
            leaderboard.
          </p>
        </div>
                {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div
                  className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.bg} blur-2xl opacity-50 transition-opacity group-hover:opacity-100`}
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
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-cyan-500/5 sm:p-7"
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
                {/* Recent Activity */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-semibold text-white">
              Recent Activity
            </h2>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-white/10 hover:bg-white/[0.05]"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${activity.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${activity.tone}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        {activity.message}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <Target className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                No activity yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                Start by exploring bounties and showcasing your skills.
              </p>
              <button
                onClick={() => router.push("/bounties")}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,.35)]"
              >
                <Search className="h-4 w-4" />
                Find Bounties
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BountyHunterDashboard;
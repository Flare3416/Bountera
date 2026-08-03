"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  SearchX,
  FileText,
  Briefcase,
  Rocket,
  Trophy,
  Link2,
  BarChart3,
  Heart,
  X,
  Loader2,
  Globe,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

import BountyHunterNavbar from "@/components/BountyHunterNavbar";
import BountyPosterNavbar from "@/components/BountyPosterNavbar";
import Navbar from "@/components/Navbar";

import { getUserPoints, getUserRank } from "@/utils/pointsSystem";

const UserProfile = () => {
  const { username } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState("");
  const [donateName, setDonateName] = useState("");
  const [donateMessage, setDonateMessage] = useState("");
  const [userStats, setUserStats] = useState({
    points: 0,
    rank: null,
    applications: {
      total: 0,
      completed: 0,
    },
  });

  const userProfileImage = userData?.profileImage || null;
  const userBackgroundImage = userData?.backgroundImage || null;
  const userDisplayName = userData?.name || "Creator";

  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(
          `/api/users/profile/${encodeURIComponent(username)}`
        );

        if (!res.ok) {
          setNotFound(true);
          return;
        }

        const user = await res.json();

        setUserData(user);

        if (user.role === "HUNTER") {
          const applicationsRes = await fetch(`/api/applications?applicantEmail=${encodeURIComponent(user.email)}`);

          if (!applicationsRes.ok) {
            throw new Error("Failed to load applications");
          }

          const applications = await applicationsRes.json();

          const [points, rank] = await Promise.all([
            getUserPoints(user.email),
            getUserRank(user.email),
          ]);

          setUserStats({
            points,
            rank,
            applications: {
              total: applications.length,
              completed: applications.filter(
                (a) => a.status === "COMPLETED"
              ).length,
            },
          });
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const loadCurrentUser = async () => {
      try {
        const res = await fetch(
          `/api/users/${encodeURIComponent(session.user.email)}`
        );

        if (!res.ok) return;

        const user = await res.json();

        setCurrentUser(user);
        setUserRole(user.role);
      } catch (error) {
        console.error(error);
      }
    };

    loadCurrentUser();
  }, [session]);

  const openDonateModal = () => {
    setDonateName(session?.user?.name || "");
    setShowDonateModal(true);
  };

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert("Please enter a valid donation amount!");
      return;
    }

    if (!donateName.trim()) {
      alert("Please enter your name!");
      return;
    }

    const donorEmail = session?.user?.email || null;

    const donationRes = await fetch("/api/donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        donorEmail,
        donorName: donateName,
        recipientEmail: userData.email,
        amount: Number(donateAmount),
        message: donateMessage,
      })
    });

    if (!donationRes.ok) {
      throw new Error("Failed to create donation");
    }

    alert(
      `Successfully donated $${donateAmount} to @${userData.username}! Thank you for your support!`
    );
    setShowDonateModal(false);
    setDonateAmount("");
    setDonateName("");
    setDonateMessage("");
  };

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
          <h2 className="text-2xl font-bold text-white">Loading Profile</h2>
          <p className="mt-2 text-sm text-slate-400">
            Fetching @{username}&apos;s profile...
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <SearchX className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Profile Not Found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            The user @{username} doesn&apos;t exist or hasn&apos;t completed
            their profile setup.
          </p>
          <button
            onClick={() => router.push("/leaderboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }


    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[160px]" />

      {session ? (
        userRole === "POSTER" ? (
          <BountyPosterNavbar />
        ) : (
          <BountyHunterNavbar />
        )
      ) : (
        <Navbar />
      )}

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
                  {userDisplayName}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  @{userData.username}
                </p>

                {userData?.skills && userData.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {userData.skills.slice(0, 3).map((skill, index) => {
                    const skillName =
                      typeof skill === "string" ? skill : skill?.name || "";

                    return (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
                      >
                        {skillName.length > 18
                          ? skillName.substring(0, 18) + "..."
                          : skillName}
                      </span>
                    );
                  })}
                    {userData.skills.length > 3 && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                        +{userData.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {userData?.role === "HUNTER" &&
                (!session || session.user?.email !== userData.email) && (
                  <div className="shrink-0">
                    <button
                      onClick={openDonateModal}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,.35)]"
                    >
                      <Heart className="h-4 w-4" />
                      Support
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Bio */}
            {userData?.bio && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-lg font-semibold text-white">About</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {userData.bio}
                </p>
              </div>
            )}

            {/* Experience */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">Experience</h2>
              </div>

              {userData?.experience && userData.experience.length > 0 ? (
                <div className="space-y-4">
                  {userData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="relative border-l-2 border-white/10 pl-5"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                      <h3 className="text-sm font-semibold text-white">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-slate-400">{exp.company}</p>
                      <p className="text-[11px] text-slate-500">
                        {exp.duration}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Briefcase className="h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No experience added yet
                  </p>
                </div>
              )}
            </div>
                        {/* Projects */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">
                  Projects Showcase
                </h2>
              </div>

              {userData?.projects && userData.projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {userData.projects.map((project, index) => (
                    <div
                      key={index}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                    >
                      {project.image && (
                        <div className="relative h-32 w-full overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-white">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          {project.description}
                        </p>
                        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400"
                              >
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
                            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
                          >
                            View Project
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Rocket className="h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No projects showcased yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">
                  Achievements
                </h2>
              </div>

              {userData?.achievements && userData.achievements.length > 0 ? (
                <div className="space-y-3">
                  {userData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
                    >
                      <span className="text-lg">
                        {achievement.icon || "🏆"}
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-slate-200">
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center">
                  <Trophy className="h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No achievements yet
                  </p>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">Connect</h2>
              </div>

              {userData?.socialLinks && userData.socialLinks.length > 0 ? (
                <div className="space-y-2">
                  {userData.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span>{link.platform}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-slate-600" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center">
                  <Link2 className="h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No social links added
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">Stats</h2>
              </div>

              <div className="space-y-3 text-sm">
                {userData?.role === "HUNTER" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Points</span>
                      <span className="font-semibold text-white">
                        {userStats.points}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Global Rank</span>
                      <span className="font-semibold text-white">
                        #{userStats.rank || "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Applications</span>
                      <span className="font-semibold text-white">
                        {userStats.applications.total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Completed</span>
                      <span className="font-semibold text-white">
                        {userStats.applications.completed}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Profile Views</span>
                      <span className="font-semibold text-white">--</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Bounties Posted</span>
                      <span className="font-semibold text-white">--</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Projects Done</span>
                      <span className="font-semibold text-white">--</span>
                    </div>
                  </>
                )}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Member Since</span>
                    <span className="font-semibold text-white">
                      {userData?.createdAt
                        ? new Date(userData.createdAt).getFullYear()
                        : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
            {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => {
                setShowDonateModal(false);
                setDonateAmount("");
                setDonateName("");
                setDonateMessage("");
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Support @{userData?.username}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Your donation helps them continue their work
                </p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={donateName}
                    onChange={(e) => setDonateName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                {/* Quick amounts */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-300">
                    Choose Amount
                  </label>
                  <div className="mb-2 grid grid-cols-4 gap-2">
                    {[5, 10, 25, 50].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonateAmount(amount.toString())}
                        className={`h-10 rounded-xl text-sm font-bold transition ${
                          donateAmount === amount.toString()
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                            : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
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
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Message (Optional)
                  </label>
                  <textarea
                    value={donateMessage}
                    onChange={(e) => setDonateMessage(e.target.value)}
                    placeholder="Leave a supportive message..."
                    rows={3}
                    className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDonateModal(false);
                      setDonateAmount("");
                      setDonateName("");
                      setDonateMessage("");
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDonate}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,.35)]"
                  >
                    Donate ${donateAmount || "0"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
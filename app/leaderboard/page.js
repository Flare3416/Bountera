'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Trophy,
  ArrowLeft,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import BountyHunterNavbar from '@/components/BountyHunterNavbar';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import Navbar from '@/components/Navbar';

const Leaderboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const loadCreators = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");

      if (!res.ok) {
        throw new Error("Failed to load leaderboard");
      }

      const data = await res.json();

      setCreators(data);
      setFilteredCreators(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCreators(creators);
    } else {
      const filtered = creators.filter(
        (creator) =>
          (creator.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (creator.username || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCreators(filtered);
    }
    setVisibleCount(10);
  }, [searchTerm, creators]);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const loadUser = async () => {
      try {
        const res = await fetch(
          `/api/users/${encodeURIComponent(session.user.email)}`
        );

        if (!res.ok) return;

        const user = await res.json();
        setUserRole(user.role);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, [session]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleProfileClick = (username) => {
    router.push(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-100" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Leaderboard</h2>
          <p className="mt-2 text-sm text-slate-400">Gathering ranked creators...</p>
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-cyan-400/20 border-t-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  const visibleCreators = filteredCreators.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCreators.length;

  return (    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-100" />
      <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[170px]" />
      <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-violet-600/10 blur-[160px]" />

      {session ? (
        userRole === "POSTER" ? (
          <BountyPosterNavbar />
        ) : (
          <BountyHunterNavbar />
        )
      ) : (
        <Navbar />
      )}

      <main className="relative z-10 mx-auto max-w-5xl px-4 pt-20 pb-16">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Community Rankings
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Creator
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              {' '}Leaderboard
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Discover the highest ranked creators and see who&apos;s leading the Bountera community.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (session) {
                  router.push(userRole === "POSTER" ? '/bounty-dashboard' : '/dashboard');
                } else {
                  router.push('/');
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              {session ? 'Dashboard' : 'Home'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search creators..."
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 backdrop-blur-xl outline-none transition-all duration-300 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
            />
          </div>

          <div className="mt-5 space-y-3">
                        {visibleCreators.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-14 text-center backdrop-blur-xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                  <Search className="h-7 w-7 text-slate-500" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  {searchTerm ? 'No creators found' : 'No creators yet'}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                  {searchTerm
                    ? `No creators match "${searchTerm}". Try another search.`
                    : 'The leaderboard is empty. Complete your creator profile to become the first ranked creator.'}
                </p>
                {!searchTerm && userRole !== "POSTER" && (
                  <button
                    onClick={() => router.push('/profile-setup')}
                    className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,.35)]"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            ) : (
              <>
                {visibleCreators.map((creator) => (
                  <div
                    key={creator.email}
                    onClick={() => handleProfileClick(creator.username)}
                    className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/[0.07] hover:shadow-[0_0_30px_rgba(34,211,238,.12)]"
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-md ${
                          creator.rank === 1
                            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-slate-900'
                            : creator.rank === 2
                            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900'
                            : creator.rank === 3
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                            : 'border border-white/10 bg-white/5 text-white'
                        }`}
                      >
                        {creator.rank <= 3
                          ? creator.rank === 1
                            ? '🥇'
                            : creator.rank === 2
                            ? '🥈'
                            : '🥉'
                          : creator.rank}
                      </div>

                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10">
                        <Image
                          src={creator.profileImage || '/defaultpfp.jpg'}
                          alt={creator.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-110"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white transition-colors group-hover:text-cyan-300 truncate">
                          {creator.name}
                        </h3>
                        <p className="text-xs text-slate-400">@{creator.username}</p>
                        {creator.skills?.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {creator.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={`${creator.email}-${index}`}
                                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300"
                              >
                                {skill.name.length > 14? `${skill.name.substring(0, 14)}...`: skill.name}
                              </span>
                            ))}
                            {creator.skills.length > 3 && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                                +{creator.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-black text-white">
                            {creator.points.toLocaleString()}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            Points
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-600 transition duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
                        {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,.35)]"
                >
                  Load More
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                    {filteredCreators.length - visibleCount}
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            )}

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-slate-400">
                  Showing{' '}
                  <span className="font-semibold text-white">
                    {Math.min(visibleCount, filteredCreators.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-white">
                    {filteredCreators.length}
                  </span>{' '}
                  creators
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
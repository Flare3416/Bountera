'use client';

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  Clock,
} from "lucide-react";

const Login = () => {
  const router = useRouter();

  return (
    <main className="relative h-screen overflow-hidden bg-slate-950 text-white">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="bountera-grid absolute inset-0" />

        <div className="bountera-glow bountera-glow-one" />
        <div className="bountera-glow bountera-glow-two" />

        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[130px]" />

      </div>

      {/* Back */}

      <button
        onClick={() => router.push("/")}
        className="absolute left-8 top-8 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-5 py-3 text-sm font-medium text-slate-300 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-800/70 hover:text-white"
      >

        <ArrowLeft className="h-4 w-4" />

        Back to Home

      </button>

      <section className="relative z-10 flex h-full items-center justify-center px-8">

        <div className="grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">

          {/* LEFT */}

          <div className="flex flex-col justify-center">

            <div className="mb-6 flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 shadow-[0_0_35px_rgba(103,232,249,.25)]">

                <Sparkles className="h-6 w-6 text-slate-950" />

              </div>

              <div>

                <h2 className="text-xl font-bold tracking-tight">

                  Bountera

                </h2>

                <p className="mt-1 text-sm text-slate-400">

                  Creative momentum, made visible.

                </p>

              </div>

            </div>

            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-300">

              <Sparkles className="h-3.5 w-3.5" />

              Join 12,000+ creators

            </span>

            <h1 className="max-w-lg text-4xl font-black leading-[1.05] tracking-tight lg:text-5xl">

              Continue

              <br />

              <span className="bountera-gradient-text">

                your journey.

              </span>

            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">

              Sign in to participate in premium bounties,
              collaborate with brands,
              showcase your portfolio,
              and build your creator reputation.

            </p>

            <div className="mt-6 space-y-3">

              {[
                "Premium bounty access",
                "Verified creator profile",
                "Leaderboard rankings",
                "Brand collaborations",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3"
                >

                  <div className="h-2 w-2 rounded-full bg-cyan-400" />

                  <span className="text-sm text-slate-300">

                    {item}

                  </span>

                </div>

              ))}

            </div>

            <div className="mt-7 max-w-md space-y-4">

              <button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/auth-redirect",
                  })
                }
                className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white px-5 py-4 text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,255,255,.12)]"
              >

                <div className="flex items-center gap-4">

                  <img
                    src="/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />

                  <span className="font-semibold">

                    Continue with Google

                  </span>

                </div>

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

              </button>

              <button
                onClick={() =>
                  signIn("github", {
                    callbackUrl: "/auth-redirect",
                  })
                }
                className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/10"
              >

                <div className="flex items-center gap-4">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-white"
                  >
                    <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23A11.4 11.4 0 0 1 12 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.2.69.8.58A12 12 0 0 0 12 .3Z" />
                  </svg>

                  <span className="font-semibold">

                    Continue with GitHub

                  </span>

                </div>

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

              </button>

            </div>

            <p className="mt-5 max-w-md text-xs leading-6 text-slate-500">

              By continuing you agree to our

              <span className="mx-1 cursor-pointer text-slate-300 hover:text-cyan-300">

                Terms

              </span>

              and

              <span className="mx-1 cursor-pointer text-slate-300 hover:text-cyan-300">

                Privacy Policy

              </span>

            </p>

          </div>

          <div className="flex items-center justify-end">

            <div className="relative w-full max-w-xl">

              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-cyan-400/10 via-violet-500/10 to-transparent blur-3xl" />

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-2xl">

                <div className="border-b border-white/10 p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">

                        Featured Bounty

                      </p>

                      <h2 className="mt-2 text-2xl font-bold">

                        AI Design Challenge

                      </h2>

                      <p className="mt-3 text-sm leading-7 text-slate-400">

                        Design the next generation creator workspace using AI.
                        Submit your best concept, compete with top designers,
                        and earn recognition across the community.

                      </p>

                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 shadow-[0_0_35px_rgba(103,232,249,.25)]">

                      <Trophy className="h-7 w-7 text-slate-950" />

                    </div>

                  </div>

                </div>

                <div className="space-y-6 p-6">

                  {/* Reward */}

                  <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">

                      Reward Pool

                    </p>

                    <div className="mt-2 flex items-end gap-3">

                      <h3 className="text-4xl font-black">

                        $500

                      </h3>

                      <span className="mb-1 rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-300">

                        +$200 this week

                      </span>

                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-400">

                      Cash prizes, verified creator badge,
                      featured portfolio placement,
                      and collaboration opportunities.

                    </p>

                  </div>

                  {/* Stats */}

                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10">

                      <Users className="mb-4 h-5 w-5 text-cyan-300" />

                      <h4 className="text-2xl font-bold">

                        184

                      </h4>

                      <p className="mt-1 text-sm text-slate-400">

                        Active Creators

                      </p>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-violet-400/30 hover:bg-white/10">

                      <Clock className="mb-4 h-5 w-5 text-violet-300" />

                      <h4 className="text-2xl font-bold">

                        4 Days

                      </h4>

                      <p className="mt-1 text-sm text-slate-400">

                        Remaining

                      </p>

                    </div>

                  </div>

                  {/* Activity */}

                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">

                    <div className="flex items-center justify-between">

                      <h4 className="font-semibold">

                        Live Activity

                      </h4>

                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-medium text-emerald-300">

                        LIVE

                      </span>

                    </div>

                    <div className="mt-5 space-y-4">

                      <div className="flex items-start gap-3">

                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,.8)]" />

                        <div>

                          <p className="text-sm font-medium">

                            Alex submitted a new concept

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            2 minutes ago

                          </p>

                        </div>

                      </div>

                      <div className="flex items-start gap-3">

                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.8)]" />

                        <div>

                          <p className="text-sm font-medium">

                            Reward pool increased

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            18 minutes ago

                          </p>

                        </div>

                      </div>

                      <div className="flex items-start gap-3">

                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(168,85,247,.8)]" />

                        <div>

                          <p className="text-sm font-medium">

                            CreativeLabs joined as sponsor

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            1 hour ago

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 py-3.5 font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(34,211,238,.35)]">

                    Explore Live Bounties
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

  );
};

export default Login;
'use client';

import React from 'react';
import { Briefcase, Sparkles, ArrowRight } from 'lucide-react';

const RoleSelectionModal = ({ isOpen, onRoleSelect, onClose }) => {
  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    onRoleSelect(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-6">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,.55)]">

        {/* Glow */}
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="relative p-10">

          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-4xl font-bold text-white">
              Welcome to Bountera
            </h2>

            <p className="mt-3 text-slate-400 text-lg">
              Choose how you&apos;d like to use the platform.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-8 md:grid-cols-2">

            {/* HUNTER */}
            <button
              onClick={() => handleRoleSelect('HUNTER')}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(34,211,238,.18)]"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15">
                <Sparkles className="h-7 w-7 text-cyan-400" />
              </div>

              <h3 className="text-2xl font-bold text-white">
                Creator
              </h3>

              <p className="mt-3 text-slate-400">
                Showcase your work, complete bounties, build your reputation and earn rewards.
              </p>

              <ul className="mt-6 space-y-3 text-slate-300">
                <li>• Build your portfolio</li>
                <li>• Complete paid bounties</li>
                <li>• Climb the leaderboard</li>
              </ul>

              <div className="mt-8 flex items-center text-cyan-400 font-medium">
                Continue
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* POSTER */}
            <button
              onClick={() => handleRoleSelect('POSTER')}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(139,92,246,.18)]"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
                <Briefcase className="h-7 w-7 text-violet-400" />
              </div>

              <h3 className="text-2xl font-bold text-white">
                Bounty Poster
              </h3>

              <p className="mt-3 text-slate-400">
                Post projects, discover talented creators and manage work from one dashboard.
              </p>

              <ul className="mt-6 space-y-3 text-slate-300">
                <li>• Publish bounties</li>
                <li>• Hire creators</li>
                <li>• Track submissions</li>
              </ul>

              <div className="mt-8 flex items-center text-violet-400 font-medium">
                Continue
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            You can change your role later from your account settings.
          </p>

        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
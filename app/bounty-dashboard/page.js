'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BountyPosterNavbar from '@/components/BountyPosterNavbar';
import BountyPosterDashboard from '@/components/BountyPosterDashboard';
import { getUserRole } from '@/utils/userData';
import { Loader2, Sparkles } from "lucide-react";

const BountyPosterDashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const role = getUserRole(session);
    setUserRole(role);
    if (role !== 'bounty_poster') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || (session && userRole === null)) {
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

  if (!session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Redirecting</h2>
          <p className="mt-2 text-sm text-slate-400">Sending you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BountyPosterNavbar />
      <BountyPosterDashboard />
    </>
  );
};

export default BountyPosterDashboardPage;
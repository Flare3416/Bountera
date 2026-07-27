"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import TopCreators from '@/components/TopCreators';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (status !== 'loading' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mb-4 text-4xl">✦</div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show loading state while redirecting
  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mb-4 text-4xl">✦</div>
          <p className="text-slate-300">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <TopCreators />
      <CTA />
      <Footer />
    </div>
  );
}

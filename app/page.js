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
import SakuraPetals from '@/components/SakuraPetals';


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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show loading state while redirecting
  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-pink-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 relative overflow-hidden">
      {/* Enhanced background elements with proper viewport dimensions */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,207,232,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(252,165,165,0.1),transparent_50%)]"></div>
      
      {/* More floating geometric shapes with light colors */}
      <div className="absolute top-[10vh] left-[5vw] w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full opacity-25 animate-float"></div>
      <div className="absolute top-[40vh] right-[10vw] w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[30vh] left-[15vw] w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[20vh] right-[25vw] w-28 h-28 bg-gradient-to-br from-pink-50 to-rose-100 rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-[50vh] right-[5vw] w-18 h-18 bg-gradient-to-br from-rose-200 to-orange-100 rounded-full opacity-30 animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[60vh] left-[30vw] w-14 h-14 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-25 animate-float" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute bottom-[10vh] right-[30vw] w-22 h-22 bg-gradient-to-br from-pink-100 to-rose-150 rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-[80vh] left-[70vw] w-12 h-12 bg-gradient-to-br from-rose-100 to-orange-50 rounded-full opacity-35 animate-float" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Floating Sakura Petals */}
      <SakuraPetals />
      
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Top Creators Section */}
      <TopCreators />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}

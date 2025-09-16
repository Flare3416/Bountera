"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, SparklesIcon, TrophyIcon, UsersIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';

const scrollToSection = (sectionId, offset = 100) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

const Hero = () => {
  return (
    <section id="hero" className="pt-24 pb-16 px-4 relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Enhanced background with light pink/cream theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-25 to-orange-50 opacity-80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,207,232,0.4),transparent_50%)]"></div>
      
      {/* More floating bubbles */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 rounded-full animate-float"></div>
      <div className="absolute top-20 right-16 w-16 h-16 bg-rose-200/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-orange-200/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-32 right-12 w-24 h-24 bg-pink-100/35 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-8 w-8 h-8 bg-rose-300/40 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-pink-200/30 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-orange-100/25 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute top-2/3 right-8 w-6 h-6 bg-rose-200/35 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="container mx-auto text-center relative z-10 w-full">
        <div className="animate-fade-in">
          {/* Properly sized badge with enhanced styling */}
          <Badge className="mb-6 bg-gradient-to-r from-pink-100 to-orange-50 text-pink-700 hover:from-pink-200 hover:to-orange-100 px-6 py-3 text-sm font-modern font-semibold shadow-lg border border-pink-200 rounded-full animate-bounce-gentle">
            🎯 Trusted by 15K+ Creators Worldwide
          </Badge>
          
          {/* Enhanced heading with beautiful fonts */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight font-heading">
            <span className="text-gray-800 animate-fade-in">Talent Meets</span>{" "}
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-orange-300 bg-clip-text text-transparent font-extrabold gradient-text animate-pulse-soft">
              Opportunity
            </span>
          </h1>
          
          {/* Enhanced subtitle with better typography */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-accent font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            An unmatched platform for creators to showcase their skills, compete for bounties, 
            and build their personal brand. Join the gamified future of talent discovery.
          </p>
          
          {/* Enhanced feature highlights with smooth animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14 max-w-5xl mx-auto">
            <div className="floating-card neon-card flex flex-col items-center space-y-3 p-6 rounded-3xl border border-pink-200/30 bg-white/60 backdrop-blur-lg shadow-lg shadow-pink-100/20 hover:shadow-2xl hover:shadow-pink-200/30 hover:scale-105 hover:bg-white/80 hover:border-pink-300/60 transform hover:translate-y-[-8px] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <SparklesIcon className="w-7 h-7 text-pink-500 animate-float group-hover:animate-pulse-soft filter group-hover:drop-shadow-lg group-hover:drop-shadow-pink-300/50" />
              <span className="text-pink-600 font-semibold text-sm font-accent">Portfolio Showcase</span>
            </div>
            <div className="floating-card neon-card flex flex-col items-center space-y-3 p-6 rounded-3xl border border-pink-200/30 bg-white/60 backdrop-blur-lg shadow-lg shadow-pink-100/20 hover:shadow-2xl hover:shadow-pink-200/30 hover:scale-105 hover:bg-white/80 hover:border-pink-300/60 transform hover:translate-y-[-8px] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <BanknotesIcon className="w-7 h-7 text-rose-500 animate-float group-hover:animate-pulse-soft filter group-hover:drop-shadow-lg group-hover:drop-shadow-pink-300/50" />
              <span className="text-rose-600 font-semibold text-sm font-accent">Bounty Rewards</span>
            </div>
            <div className="floating-card neon-card flex flex-col items-center space-y-3 p-6 rounded-3xl border border-pink-200/30 bg-white/60 backdrop-blur-lg shadow-lg shadow-pink-100/20 hover:shadow-2xl hover:shadow-pink-200/30 hover:scale-105 hover:bg-white/80 hover:border-pink-300/60 transform hover:translate-y-[-8px] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <TrophyIcon className="w-7 h-7 text-orange-500 animate-float group-hover:animate-pulse-soft filter group-hover:drop-shadow-lg group-hover:drop-shadow-pink-300/50" />
              <span className="text-orange-600 font-semibold text-sm font-accent">Global Leaderboard</span>
            </div>
            <div className="floating-card neon-card flex flex-col items-center space-y-3 p-6 rounded-3xl border border-pink-200/30 bg-white/60 backdrop-blur-lg shadow-lg shadow-pink-100/20 hover:shadow-2xl hover:shadow-pink-200/30 hover:scale-105 hover:bg-white/80 hover:border-pink-300/60 transform hover:translate-y-[-8px] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
              <UsersIcon className="w-7 h-7 text-pink-500 animate-float group-hover:animate-pulse-soft filter group-hover:drop-shadow-lg group-hover:drop-shadow-pink-300/50" />
              <span className="text-pink-600 font-semibold text-sm font-accent">Creator Community</span>
            </div>
          </div>
          
          {/* Enhanced CTAs with beautiful styling */}
          <div className="flex gap-6 justify-center flex-wrap animate-fade-in-up" style={{ animationDelay: '1.3s' }}>
            <Button size="lg" className="neon-button bg-gradient-to-r from-pink-100 to-orange-50 hover:from-pink-200 hover:to-orange-100 text-gray-700 px-10 py-4 text-lg font-modern font-bold !rounded-full shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-pink-200/50 w-56 group cursor-pointer" style={{ borderRadius: '9999px' }}>
              <Link href="/login">Start Your Journey</Link>
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button onClick={() => scrollToSection('features', 80)} variant="outline" size="lg" className="neon-button-outline border-2 border-pink-200 text-pink-600 hover:bg-pink-25 px-10 py-4 text-lg font-modern font-bold !rounded-full shadow-lg transition-all duration-500 hover:scale-105 glass-card w-56 cursor-pointer" style={{ borderRadius: '9999px' }}>
              View More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

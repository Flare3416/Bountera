"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section id="cta" className="py-20 px-4 relative overflow-hidden min-h-[60vh] flex items-center">
      {/* Enhanced animated background with light theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/30 to-transparent animate-pulse"></div>
      
      {/* Floating elements with light colors - increased quantity */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-pink-200/30 rounded-full animate-float"></div>
      <div className="absolute bottom-10 right-10 w-12 h-12 bg-rose-200/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-orange-200/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-16 right-1/3 w-20 h-20 bg-pink-100/25 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-1/2 w-14 h-14 bg-rose-100/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/3 right-16 w-10 h-10 bg-orange-100/35 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-1/3 left-16 w-6 h-6 bg-pink-200/40 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute top-2/3 left-2/3 w-18 h-18 bg-rose-200/20 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="container mx-auto text-center relative z-10 w-full">
        <div className="animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-gray-800 tracking-tight font-heading">
            Ready to Start Your{" "}
            <span className="gradient-text font-extrabold">
              Journey?
            </span>
          </h2>
          <p className="text-xl mb-12 text-gray-600 max-w-3xl mx-auto font-accent font-medium leading-relaxed">
            Join thousands of creators building their future on Bountera. 
            Your next opportunity is just one click away!
          </p>
          
          <Button 
            size="lg" 
            variant="secondary" 
            className="neon-button bg-gradient-to-r from-pink-100 to-orange-50 text-gray-700 hover:from-pink-200 hover:to-orange-100 px-12 py-5 text-2xl font-modern font-black rounded-2xl shadow-lg hover:scale-110 transition-all duration-500 hover:shadow-pink-200/50 animate-bounce-gentle cursor-pointer"
          >
            🚀 Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;

"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  // Smooth scroll function with custom offset
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

  return (
    <nav className="fixed top-0 w-full glass-card z-50 border-b border-pink-100 shadow-lg backdrop-blur-md bg-white/30">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Enhanced Logo */}
        <div className="flex items-center space-x-3 animate-fade-in cursor-pointer" onClick={() => scrollToSection('hero', 0)}>
          <div className="text-3xl">🌸</div>
          <div className="text-2xl font-black gradient-text font-heading">
            Bountera
          </div>
        </div>
        
        {/* Enhanced Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          <button 
            onClick={() => scrollToSection('hero', 0)} 
            className="text-gray-600 hover:text-pink-500 transition-all duration-400 font-accent font-medium relative group cursor-pointer"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            onClick={() => scrollToSection('features', 80)} 
            className="text-gray-600 hover:text-pink-500 transition-all duration-400 font-accent font-medium relative group cursor-pointer"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            onClick={() => scrollToSection('creators', 80)} 
            className="text-gray-600 hover:text-pink-500 transition-all duration-400 font-accent font-medium relative group cursor-pointer"
          >
            Top Creators
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 group-hover:w-full transition-all duration-300"></span>
          </button>
          
          <a href='/bounties'
            className="text-gray-600 hover:text-pink-500 transition-all duration-400 font-accent font-medium relative group cursor-pointer"
          >
            Bounties
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 group-hover:w-full transition-all duration-300"></span>
          </a>

          <a href='/leaderboard'
            className="text-gray-600 hover:text-pink-500 transition-all duration-400 font-accent font-medium relative group cursor-pointer"
          >
            Leaderboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
           <Button className="w-25 neon-button bg-gradient-to-r from-pink-100 to-orange-50 hover:from-pink-200 hover:to-orange-100 text-gray-700 px-6 py-2 font-modern font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            Login
          </Button>
          <Button className="w-25 neon-button bg-gradient-to-r from-pink-100 to-orange-50 hover:from-pink-200 hover:to-orange-100 text-gray-700 px-6 py-2 font-modern font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
"use client";

import React from 'react';
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: "🎨",
      title: "Portfolio Showcase",
      description: "Create stunning portfolios to display your work and attract opportunities"
    },
    {
      icon: "🎯",
      title: "Bounty Hunting", 
      description: "Claim and complete bounties from organizations worldwide"
    },
    {
      icon: "🏆",
      title: "Global Rankings",
      description: "Compete on public leaderboards and boost your visibility"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 relative min-h-[80vh] flex items-center">
      {/* Enhanced background with lighter theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-25/30 via-rose-25/20 to-orange-25/30"></div>
      
      {/* Subtle segmentation divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
      
      <div className="container mx-auto relative z-10 w-full">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight font-heading">
            <span className="text-gray-800">Unmatched Experience</span>{" "}
            <span className="gradient-text font-extrabold">
              for creators
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-accent">
            Content is everything, but we provide a platform that is unmatched — portfolio showcases, 
            bounty hunting, skill competitions, global rankings, and community networking.
          </p>
        </div>
        
        {/* Enhanced floating feature cards with subtle neon effects */}
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="floating-card neon-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <Card className="group relative h-80 border border-pink-200/30 rounded-3xl overflow-hidden transition-all duration-500 p-8 bg-white/60 backdrop-blur-lg shadow-lg shadow-pink-100/20 hover:shadow-2xl hover:shadow-pink-200/30 hover:scale-105 hover:bg-white/80 hover:border-pink-300/60 transform hover:translate-y-[-8px]">
                <div className="h-full flex flex-col justify-center items-center text-center">
                  <div className="text-6xl mb-6 transition-all duration-500 group-hover:scale-110 animate-float group-hover:animate-pulse-soft filter group-hover:drop-shadow-lg group-hover:drop-shadow-pink-300/50">
                    {feature.icon}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-4 text-pink-600 group-hover:text-pink-700 transition-colors duration-500 font-heading">
                    {feature.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 text-base leading-relaxed group-hover:text-gray-700 transition-colors duration-500 font-accent">
                    {feature.description}
                  </CardDescription>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom segmentation divider */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
    </section>
  );
};

export default Features;

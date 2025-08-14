"use client";

import React from 'react';
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TopCreators = () => {
  const creators = [
    { name: "Yuki Tanaka", skill: "UI/UX Designer", bounties: 24, earnings: "$15.2K", rank: "🥈" },
    { name: "Alex Chen", skill: "Full Stack Developer", bounties: 31, earnings: "$22.8K", rank: "🏆" },
    { name: "Maria Silva", skill: "Digital Artist", bounties: 18, earnings: "$12.5K", rank: "🥉" }
  ];

  return (
    <section id="creators" className="py-20 px-4 relative min-h-[80vh] flex items-center">
      {/* Enhanced background with lighter theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-25/30 via-pink-25/20 to-orange-25/30"></div>
      
      {/* Subtle segmentation divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
      
      <div className="container mx-auto relative z-10 w-full">
        <div className="text-center mb-20 animate-fade-in">
          <Badge className="mb-6 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-6 py-3 text-base font-modern font-bold rounded-full animate-pulse-soft">
            🌟 Featured Creators
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-800 tracking-tight font-heading">
            Meet Our Top Performers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-accent leading-relaxed">
            Discover the talented creators who are leading the way on Bountera
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {creators.map((creator, index) => (
            <div
              key={index}
              className="floating-card neon-card animate-fade-in-up"
              style={{ animationDelay: `${index * 250}ms` }}
            >
              <Card className="group relative h-96 border border-pink-200/30 rounded-3xl overflow-hidden transition-all duration-500 p-8 bg-white/60 backdrop-blur-lg shadow-lg shadow-pink-100/20 hover:shadow-2xl hover:shadow-pink-200/30 hover:scale-105 hover:bg-white/80 hover:border-pink-300/60 transform hover:translate-y-[-8px]">
                
                <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
                  {/* Enhanced rank badge */}
                  <div className="absolute top-6 right-6 text-3xl animate-bounce-gentle">
                    {creator.rank}
                  </div>
                  
                  {/* Enhanced Avatar */}
                  <Avatar className="w-24 h-24 mx-auto mb-6 ring-4 ring-pink-200 ring-offset-4 ring-offset-white group-hover:ring-pink-300 transition-all duration-500 group-hover:scale-105 animate-glow-pulse">
                    <AvatarFallback className="bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 text-xl font-black font-modern">
                      {creator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <CardTitle className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors duration-500 font-heading">
                    {creator.name}
                  </CardTitle>
                  
                  <Badge className="mb-6 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 px-4 py-2 text-sm font-accent font-semibold rounded-full">
                    {creator.skill}
                  </Badge>
                  
                  {/* Enhanced stats */}
                  <div className="flex justify-around w-full">
                    <div className="text-center">
                      <div className="text-3xl font-black text-pink-500 group-hover:scale-105 transition-transform duration-500 font-modern">
                        {creator.bounties}
                      </div>
                      <div className="text-gray-500 font-semibold text-sm font-accent mt-1">Bounties</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-green-600 group-hover:scale-105 transition-transform duration-500 font-modern">
                        {creator.earnings}
                      </div>
                      <div className="text-gray-500 font-semibold text-sm font-accent mt-1">Earned</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom segmentation divider */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
    </section>
  );
};

export default TopCreators;

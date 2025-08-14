"use client";

import React from 'react';

const SakuraPetals = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-1">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${20 + Math.random() * 15}s`,
            top: `${-10 - Math.random() * 10}%`,
          }}
        />
      ))}
    </div>
  );
};

export default SakuraPetals;

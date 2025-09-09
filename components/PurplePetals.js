"use client";

import React, { useState, useEffect } from 'react';

const PurplePetals = () => {
  const [petals, setPetals] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Generate petal data only on client side to avoid hydration mismatch
    setIsClient(true);
    const petalData = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 20,
      animationDuration: 20 + Math.random() * 15,
      top: -10 - Math.random() * 10,
    }));
    setPetals(petalData);
  }, []);

  // Don't render anything on server to prevent hydration mismatch
  if (!isClient) {
    return <div className="fixed inset-0 overflow-hidden pointer-events-none z-1"></div>;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-1">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="purple-petal"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.animationDelay}s`,
            animationDuration: `${petal.animationDuration}s`,
            top: `${petal.top}%`,
          }}
        />
      ))}
    </div>
  );
};

export default PurplePetals;

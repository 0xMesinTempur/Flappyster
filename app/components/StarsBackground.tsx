"use client";
import React, { useEffect, useState } from "react";

const STAR_COUNT = 60;

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

type Star = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

export default function StarsBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: STAR_COUNT }).map(() => ({
      left: randomBetween(0, 100),
      top: randomBetween(0, 100),
      size: randomBetween(1, 3),
      duration: randomBetween(6, 16),
      delay: randomBetween(0, 8),
    }));
    setStars(generated);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-80 animate-star-float"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            boxShadow: `0 0 ${star.size * 4}px 1px white`,
          }}
        />
      ))}
    </div>
  );
} 
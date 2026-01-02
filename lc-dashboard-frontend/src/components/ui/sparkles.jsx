import React, { memo, useMemo } from "react";

// Optimized: Reduced particle count and use CSS animations
export const SparklesCore = memo(function SparklesCore({
  id = "tsparticlesfullpage",
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleCount = 20, // Reduced from 100
  className = "",
  particleColor = "#FFF",
}) {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
  }, [particleCount, minSize, maxSize]);

  return (
    <div
      id={id}
      className={`absolute inset-0 ${className}`}
      style={{ background }}
    >
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .sparkle-particle {
          animation: sparkle var(--duration) var(--delay) infinite ease-in-out;
        }
      `}</style>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full sparkle-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            '--delay': particle.animationDelay,
            '--duration': particle.animationDuration,
          }}
        />
      ))}
    </div>
  );
});

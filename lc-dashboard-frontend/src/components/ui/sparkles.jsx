import React from "react";
import { motion } from "framer-motion";

export function SparklesCore({
  id = "tsparticlesfullpage",
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleCount = 100,
  className = "",
  particleColor = "#FFF",
}) {
  const particles = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, [particleCount, minSize, maxSize]);

  return (
    <div
      id={id}
      className={`absolute inset-0 ${className}`}
      style={{ background }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

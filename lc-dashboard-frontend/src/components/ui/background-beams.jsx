import React, { memo } from "react";

// Optimized: Use CSS animations instead of Framer Motion for better performance
export const BackgroundBeams = memo(function BackgroundBeams({ className }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ""}`}>
      <svg
        className="absolute w-full h-full opacity-30"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Static paths with CSS opacity - no JS animations */}
        <path
          d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
          stroke="url(#beamGradient)"
          strokeOpacity="0.3"
          strokeWidth="0.5"
        />
        <path
          d="M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851"
          stroke="url(#beamGradient)"
          strokeOpacity="0.25"
          strokeWidth="0.5"
        />
        <path
          d="M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827"
          stroke="url(#beamGradient)"
          strokeOpacity="0.2"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#18CCFC" stopOpacity="0" />
            <stop offset="0.325" stopColor="#18CCFC" />
            <stop offset="1" stopColor="#6344F5" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});

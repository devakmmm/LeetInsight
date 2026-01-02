import React, { memo } from "react";
import { Flame, Target } from "lucide-react";

export const StreakDisplay = memo(function StreakDisplay({ streak }) {
  const isOnStreak = streak > 0;
  
  return (
    <div
      className={`rounded-2xl p-6 border backdrop-blur-xl transition-all shadow-xl ${
        isOnStreak
          ? "bg-gradient-to-br from-orange-500/20 via-red-500/10 to-yellow-500/10 border-orange-500/40 shadow-orange-500/20"
          : "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-white/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${
          isOnStreak 
            ? "bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-500/40"
            : "bg-gray-700/50 border border-white/10"
        }`}>
          {isOnStreak ? (
            <Flame className="h-8 w-8 text-orange-400 fill-orange-400 animate-pulse drop-shadow-lg" />
          ) : (
            <Target className="h-8 w-8 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <div className={`text-sm font-semibold uppercase tracking-wider ${
            isOnStreak ? "text-orange-400" : "text-gray-500"
          }`}>
            {isOnStreak ? "🔥 On Fire" : "Start Your Streak"}
          </div>
          <div className="text-4xl font-bold text-white mt-1">
            {streak}
            <span className="text-lg text-gray-400 font-normal ml-2">
              day{streak !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {isOnStreak
              ? "Keep it going! Take a snapshot today to maintain your streak"
              : "Solve a problem today to start your streak"}
          </div>
        </div>
      </div>
    </div>
  );
});

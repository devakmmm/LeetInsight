import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function StreakDisplay({ streak }) {
  const isOnStreak = streak > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-6 border-2 transition-all ${
        isOnStreak
          ? "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-400/50"
          : "bg-muted/30 border-muted-foreground/20"
      }`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={isOnStreak ? { scale: [1, 1.2, 1] } : {}}
          transition={isOnStreak ? { repeat: Infinity, duration: 2 } : {}}
          className="text-5xl"
        >
          {isOnStreak ? (
            <Flame className="h-12 w-12 text-orange-500 fill-orange-500" />
          ) : (
            <span className="text-4xl">🎯</span>
          )}
        </motion.div>

        <div className="flex-1">
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
            {isOnStreak ? "On Fire" : "Start Your Streak"}
          </div>
          <div className="text-4xl font-bold text-foreground mt-1">
            {streak}
            <span className="text-lg text-muted-foreground font-normal ml-2">
              day{streak !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {isOnStreak
              ? "Keep it going! Take a snapshot today to maintain your streak"
              : "Solve a problem today to start your streak"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

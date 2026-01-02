import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Crown, Rocket, Star, Lock } from "lucide-react";

const premiumFeatures = [
  { icon: <Zap className="h-5 w-5" />, title: "Unlimited History", description: "365+ days of progress tracking" },
  { icon: <Crown className="h-5 w-5" />, title: "Advanced Analytics", description: "Deep insights into your patterns" },
  { icon: <Rocket className="h-5 w-5" />, title: "Export Data", description: "Download your progress as CSV/PDF" },
  { icon: <Star className="h-5 w-5" />, title: "Priority Support", description: "Get help when you need it" },
];

export function PremiumComingSoon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20 p-8"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl opacity-50" />
      
      {/* Sparkle effects */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-8 w-8 text-purple-400/50" />
        </motion.div>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star className="h-6 w-6 text-yellow-400/30" />
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              Premium
              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                Coming Soon
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">Unlock the full potential</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {premiumFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-white/5 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            disabled
          >
            <Lock className="h-4 w-4" />
            Notify Me When Available
          </motion.button>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Be the first to know when Premium launches
          </p>
        </div>

        {/* Price teaser */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-foreground">$9.99</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Early adopters get <span className="text-green-400 font-medium">50% off</span> for life
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useRef, memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  Linkedin,
  Twitter,
  Copy,
  Check,
  X,
  BarChart3,
  Trophy,
  Zap,
  Target,
} from "lucide-react";
import html2canvas from "html2canvas";

// Tier configuration
const TIER_CONFIG = {
  Bronze: { icon: "🥉", color: "from-amber-700 to-amber-900", text: "text-amber-500" },
  Silver: { icon: "🥈", color: "from-slate-400 to-slate-600", text: "text-slate-300" },
  Gold: { icon: "🥇", color: "from-yellow-400 to-yellow-600", text: "text-yellow-400" },
  Platinum: { icon: "💎", color: "from-cyan-300 to-cyan-500", text: "text-cyan-300" },
  Diamond: { icon: "💠", color: "from-blue-400 to-purple-500", text: "text-blue-300" },
  Iridescent: { icon: "👑", color: "from-fuchsia-400 via-purple-400 to-cyan-400", text: "text-fuchsia-300" },
};

function getTierFromSolved(total) {
  if (total >= 1500) return "Iridescent";
  if (total >= 1000) return "Diamond";
  if (total >= 600) return "Platinum";
  if (total >= 300) return "Gold";
  if (total >= 100) return "Silver";
  return "Bronze";
}

// The actual stats card that will be converted to image
const StatsCard = memo(function StatsCard({ username, solved, readiness, streak, velocity }) {
  const tier = getTierFromSolved(solved?.all || 0);
  const tierConfig = TIER_CONFIG[tier];

  return (
    <div
      id="stats-card"
      className="w-[600px] p-8 rounded-3xl relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">LeetSight</div>
              <div className="text-sm text-gray-400">LeetCode Analytics</div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${tierConfig.color} flex items-center gap-2`}>
            <span className="text-lg">{tierConfig.icon}</span>
            <span className="text-white font-bold">{tier}</span>
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-1">@{username}</div>
          <div className="text-3xl font-bold text-white">
            {solved?.all || 0} <span className="text-lg font-normal text-gray-400">problems solved</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-green-400">{solved?.easy || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Easy</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">{solved?.medium || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Medium</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-red-400">{solved?.hard || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Hard</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-orange-400">{streak || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Day Streak</div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              <span className="text-white font-semibold">{readiness || 0}%</span>
              <span className="text-gray-400 text-sm">Readiness</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <span className="text-white font-semibold">{velocity || 0}</span>
              <span className="text-gray-400 text-sm">problems/day</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            leetsight.netlify.app
          </div>
        </div>
      </div>
    </div>
  );
});

// Share Modal Component
export const ShareStatsModal = memo(function ShareStatsModal({
  isOpen,
  onClose,
  username,
  solved,
  readiness,
  streak,
  velocity,
}) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const profileUrl = `https://leetsight.netlify.app`;
  
  const shareText = `🚀 My LeetCode Stats via LeetSight:

📊 ${solved?.all || 0} problems solved
🟢 ${solved?.easy || 0} Easy | 🟡 ${solved?.medium || 0} Medium | 🔴 ${solved?.hard || 0} Hard
🔥 ${streak || 0} day streak
💪 ${readiness || 0}% interview ready

Track your LeetCode progress: ${profileUrl}

#LeetCode #CodingInterview #TechJobs #SoftwareEngineering`;

  const downloadImage = async () => {
    const card = document.getElementById("stats-card");
    if (!card) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `leetsight-${username}-stats.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download:", err);
    } finally {
      setDownloading(false);
    }
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white z-20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white">Share Your Stats</h3>
          <p className="text-sm text-gray-400 mt-1">
            Show off your LeetCode progress!
          </p>
        </div>

        {/* Stats Card Preview */}
        <div className="flex justify-center mb-6 overflow-x-auto">
          <div className="transform scale-[0.85] origin-top">
            <StatsCard
              username={username}
              solved={solved}
              readiness={readiness}
              streak={streak}
              velocity={velocity}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={shareToLinkedIn}
              className="h-12 bg-[#0A66C2] hover:bg-[#004182] text-white"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              Share on LinkedIn
            </Button>
            <Button
              onClick={shareToTwitter}
              className="h-12 bg-black hover:bg-gray-900 text-white border border-white/20"
            >
              <Twitter className="h-5 w-5 mr-2" />
              Share on X
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={downloadImage}
              disabled={downloading}
              variant="outline"
              className="h-12 border-white/10 text-white hover:bg-white/5"
            >
              <Download className="h-5 w-5 mr-2" />
              {downloading ? "Downloading..." : "Download Image"}
            </Button>
            <Button
              onClick={copyText}
              variant="outline"
              className="h-12 border-white/10 text-white hover:bg-white/5"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Text
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-sm text-emerald-400 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Pro tip:</strong> Share your stats on LinkedIn with #LeetCode to get visibility from recruiters!
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// Floating Share Button (optional - for dashboard)
export const ShareButton = memo(function ShareButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="h-11 px-5 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-medium shadow-lg shadow-emerald-500/25"
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share Stats
    </Button>
  );
});

export default ShareStatsModal;

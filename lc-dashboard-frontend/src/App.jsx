import React, { useEffect, useMemo, useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  RefreshCw,
  Link as LinkIcon,
  Timer,
  ShieldCheck,
  Gauge,
  ArrowUpRight,
  CalendarClock,
  LogOut,
  Linkedin,
  Github,
  Crown,
  Zap,
  Brain,
  Rocket,
  ChevronRight,
} from "lucide-react";
//import { AdBanner } from "@/components/AdBanner"; // Disabled for growth phase
import { AuthPage } from "@/components/AuthPage";
//import { PricingModal } from "@/components/PricingModal"; // Disabled for growth phase
import { StreakDisplay } from "@/components/StreakDisplay";
import { PremiumComingSoon } from "@/components/PremiumComingSoon";
import { useAuth } from "@/lib/AuthContext";
import { BackgroundBeams } from "@/components/ui/background-beams";

// ----------------------------
// CONFIG
// ----------------------------
// In dev, run your API on http://localhost:5050
// In prod (Render), set VITE_API_BASE to your deployed API URL.
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";

// ----------------------------
// Small utils
// ----------------------------
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}
function fmtDate(isoOrTs) {
  const d = typeof isoOrTs === "number" ? new Date(isoOrTs * 1000) : new Date(isoOrTs);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function readinessTone(score) {
  if (score >= 80) return { label: "Strong", hint: "You’re trending interview-ready.", icon: ShieldCheck };
  if (score >= 60) return { label: "On Track", hint: "Keep momentum and deepen weak areas.", icon: TrendingUp };
  if (score >= 40) return { label: "Building", hint: "Increase consistency + breadth.", icon: Timer };
  return { label: "Starting", hint: "Focus on fundamentals + velocity.", icon: Target };
}

// ----------------------------
// Animated background accents (Optimized with CSS animations)
// ----------------------------
const AmbientAccents = memo(function AmbientAccents() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -15px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 25px) scale(1.02); }
        }
        .orb-1 { animation: float1 20s ease-in-out infinite; }
        .orb-2 { animation: float2 25s ease-in-out infinite; }
        .orb-3 { animation: float3 22s ease-in-out infinite; }
      `}</style>
      {/* Gradient Orbs - Vibrant green/emerald + accent colors */}
      <div
        className="orb-1 absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle at 30% 30%, #10b981, transparent 60%)" }}
      />
      <div
        className="orb-2 absolute -bottom-44 -right-44 h-[600px] w-[600px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle at 70% 70%, #22d3ee, transparent 60%)" }}
      />
      <div
        className="orb-3 absolute top-1/3 left-1/2 h-[400px] w-[400px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, #a855f7, transparent 60%)" }}
      />
      
      {/* Grid Pattern - More visible */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
    </div>
  );
});

// ----------------------------
// Reusable components (Optimized - no motion animations)
// ----------------------------
const GlowCard = memo(function GlowCard({ children, className, glowColor = "emerald" }) {
  const glowColors = {
    emerald: "hover:shadow-emerald-500/20",
    blue: "hover:shadow-blue-500/20",
    purple: "hover:shadow-purple-500/20",
    cyan: "hover:shadow-cyan-500/20",
    green: "hover:shadow-green-500/20",
    orange: "hover:shadow-orange-500/20",
  };
  
  const borderColors = {
    emerald: "border-emerald-500/20",
    blue: "border-blue-500/20",
    purple: "border-purple-500/20",
    cyan: "border-cyan-500/20",
    green: "border-green-500/20",
    orange: "border-orange-500/20",
  };
  
  return (
    <div
      className={cx(
        "group relative rounded-2xl border bg-black/60 p-4 backdrop-blur-xl",
        "hover:bg-black/70 hover:border-white/20 transition-all duration-300",
        borderColors[glowColor],
        glowColors[glowColor],
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
});

const Metric = memo(function Metric({ title, value, sub, icon: Icon, right, color = "emerald" }) {
  const iconBgColors = {
    emerald: "bg-emerald-500/20 border-emerald-500/30",
    blue: "bg-blue-500/20 border-blue-500/30",
    purple: "bg-purple-500/20 border-purple-500/30",
    green: "bg-green-500/20 border-green-500/30",
    orange: "bg-orange-500/20 border-orange-500/30",
    cyan: "bg-cyan-500/20 border-cyan-500/30",
  };
  
  const iconColors = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    orange: "text-orange-400",
    cyan: "text-cyan-400",
  };

  return (
    <GlowCard glowColor={color}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {Icon && <Icon className={cx("h-4 w-4", iconColors[color])} />}
            <span className="truncate font-medium">{title}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className={cx("text-3xl font-bold tracking-tight", iconColors[color])}>
              {value}
            </div>
            {right && (
              <div className="text-sm text-gray-400 font-medium">{right}</div>
            )}
          </div>
          {sub && (
            <div className="mt-2 text-xs text-gray-500 leading-relaxed">{sub}</div>
          )}
        </div>
        <div className={cx(
          "h-12 w-12 rounded-xl flex items-center justify-center border",
          iconBgColors[color]
        )}>
          <Sparkles className={cx("h-5 w-5", iconColors[color])} />
        </div>
      </div>
    </GlowCard>
  );
});

const ProgressRing = memo(function ProgressRing({ value, label }) {
  const v = clamp(value, 0, 100);
  const radius = 38;
  const stroke = 8;
  const c = 2 * Math.PI * radius;
  const offset = c - (v / 100) * c;

  // Color based on score
  const getColor = (score) => {
    if (score >= 80) return "#10b981"; // emerald
    if (score >= 60) return "#22d3ee"; // cyan
    if (score >= 40) return "#a855f7"; // purple
    return "#f97316"; // orange
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={getColor(v)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ 
              transition: 'stroke-dashoffset 0.5s ease-out',
              filter: `drop-shadow(0 0 8px ${getColor(v)}50)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">{Math.round(v)}</div>
          <div className="text-[10px] text-gray-500">/ 100</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-lg font-semibold text-emerald-400">Readiness</div>
      </div>
    </div>
  );
});

const MiniTag = memo(function MiniTag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-gray-800/50 px-2 py-1 text-xs text-gray-400">
      {children}
    </span>
  );
});

const EmptyState = memo(function EmptyState({ title, subtitle, action }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-8 text-center backdrop-blur-xl">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
        <Gauge className="h-6 w-6 text-emerald-400" />
      </div>
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-gray-400">{subtitle}</div>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
});

// Simplified ReadinessFlip - removed flip animation for performance
const ReadinessFlip = memo(function ReadinessFlip({ readiness, tone }) {
  return (
    <GlowCard glowColor="emerald">
      <div className="flex items-center gap-4">
        <ProgressRing value={readiness?.composite ?? 0} label={tone.label} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <tone.icon className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white">{tone.label}</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">{tone.hint}</p>
        </div>
      </div>
    </GlowCard>
  );
});

function LoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
          <Skeleton className="h-4 w-28 bg-white/10" />
          <Skeleton className="mt-3 h-7 w-20 bg-white/10" />
          <Skeleton className="mt-2 h-3 w-44 bg-white/10" />
        </div>
      ))}
    </div>
  );
}

// ----------------------------
// Main App
// ----------------------------
export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  
  const [username, setUsername] = useState("remembermyname");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAd, setShowAd] = useState(false); // Disabled for growth phase
  const [showPricingModal, setShowPricingModal] = useState(false); // Disabled for growth phase

  const [insights, setInsights] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState(null);
  
  // Growth phase: Everyone gets full access, no tier restrictions
  const showAds = false; // Disabled - monetization coming later

  // All hooks must be called before any conditional returns
  const tone = useMemo(() => {
    const score = insights?.readiness?.final ?? 0;
    return readinessTone(score);
  }, [insights]);

  // Calculate streak: consecutive days with snapshots
  const streak = useMemo(() => {
    const snaps = history?.snapshots || [];
    if (snaps.length === 0) return 0;

    // Sort by date descending (most recent first)
    const sorted = [...snaps].sort(
      (a, b) => new Date(b.capturedAt) - new Date(a.capturedAt)
    );

    let count = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const snap of sorted) {
      const snapDate = new Date(snap.capturedAt);
      snapDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate - snapDate) / (1000 * 60 * 60 * 24)
      );

      // If gap is more than 1 day, streak is broken
      if (dayDiff > 1) break;
      // If it's the current iteration's expected day, count it
      if (dayDiff === count) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }, [history]);

  const historySeries = useMemo(() => {
    const snaps = history?.snapshots || [];
    return snaps.map((s) => ({
      day: fmtDay(s.capturedAt),
      all: s.solved.all,
      easy: s.solved.easy,
      medium: s.solved.medium,
      hard: s.solved.hard,
    }));
  }, [history]);

  const topTags = useMemo(() => {
    const tags = dashboard?.tags || [];
    return tags.slice(0, 12).map((t) => ({ name: t.tagName, solved: t.solved }));
  }, [dashboard]);

  const fetchAll = async (u = username, d = days) => {
    const uname = (u || "").trim();
    if (!uname) return;

    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams({ days: String(d) }).toString();
      const [ins, dash, hist] = await Promise.all([
        fetch(`${API_BASE}/api/leetcode/insights/${encodeURIComponent(uname)}?${qs}`).then((r) => r.json()),
        fetch(`${API_BASE}/api/leetcode/dashboard/${encodeURIComponent(uname)}`).then((r) => r.json()),
        fetch(`${API_BASE}/api/leetcode/history/${encodeURIComponent(uname)}?${qs}`).then((r) => r.json()),
      ]);

      if (!ins.ok) throw new Error(ins.error || "Insights failed");
      if (!dash.ok) throw new Error(dash.error || "Dashboard failed");

      // history may fail if you have no snapshots yet; handle gracefully
      setInsights(ins.data);
      setDashboard(dash.data);
      setHistory(hist.ok ? hist.data : null);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const takeSnapshot = async () => {
    const uname = username.trim();
    if (!uname) return;

    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/leetcode/snapshot/${encodeURIComponent(uname)}`, {
        method: "POST",
      }).then((x) => x.json());

      if (!r.ok) throw new Error(r.error || "Snapshot failed");

      await fetchAll(uname, days);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAll(username, days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show auth page if not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => window.location.reload()} />;
  }

  const solved = insights?.profile?.solved;
  const readiness = insights?.readiness;
  const velocity = insights?.history?.velocity;
  const nextTopics = insights?.recommendations?.nextTopics || [];
  const recentAccepted = dashboard?.recentAccepted || [];

  const ToneIcon = tone.icon;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="relative">
        <AmbientAccents />
        <BackgroundBeams className="opacity-30" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          {/* Ad Banner disabled - focusing on growth before monetization */}
          {/* 
          {showAds && showAd && (
            <AdBanner onClose={() => setShowAd(false)} onUpgradeClick={() => setShowPricingModal(true)} />
          )}

          {showPricingModal && (
            <PricingModal onClose={() => setShowPricingModal(false)} onPaymentSuccess={() => {
              setShowPricingModal(false);
              setShowAd(false);
            }} />
          )}
          */}

          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-1.5 text-xs backdrop-blur-xl"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                <span className="text-emerald-300 font-semibold">LeetCode Intelligence</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Live Analytics</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="mt-5 text-4xl font-bold tracking-tight md:text-6xl"
              >
                <span className="text-white drop-shadow-lg">
                  Make practice
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  measurable.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-4 max-w-xl text-lg text-gray-300 leading-relaxed"
              >
                Transform your LeetCode grind into <span className="text-emerald-400 font-semibold">measurable trajectory</span>. 
                Track readiness, velocity, and get AI-powered topic recommendations.
              </motion.p>
              
              {/* Quick Stats Pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <Zap className="h-4 w-4" />
                  Real-time Sync
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                  <Rocket className="h-4 w-4" />
                  Interview Ready
                </div>
              </motion.div>
            </div>
            <div className="w-full md:w-[380px] flex-shrink-0">
              <StreakDisplay streak={streak} />
            </div>
          </div>

          {/* Query Card - Enhanced */}
          <GlowCard className="mt-8 p-6" glowColor="emerald">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Activity className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-base font-semibold text-white">Analytics Query</div>
                  <div className="text-sm text-gray-400">Fetch your latest LeetCode data</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse shadow-lg shadow-emerald-400/50" />
                  Connected
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10">
                  <span className="text-xs text-gray-400">{user.email}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your LeetCode username..."
                  className="h-12 bg-black/50 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors rounded-xl text-white placeholder:text-gray-500"
                />
              </div>
              <div className="md:w-40">
                <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                  <SelectTrigger className="h-12 bg-black/50 border-white/10 rounded-xl text-white">
                    <SelectValue placeholder="Time Window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => fetchAll(username, days)}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-500/30 transition-all duration-300 text-white font-semibold"
                disabled={loading}
              >
                <RefreshCw className={cx("mr-2 h-5 w-5", loading && "animate-spin")} />
                {loading ? "Analyzing..." : "Analyze Profile"}
              </Button>
              <Button
                onClick={takeSnapshot}
                variant="secondary"
                className="h-12 rounded-xl bg-gray-800/70 border-white/10 hover:bg-gray-700/70 hover:border-emerald-500/30 text-white"
                disabled={loading}
                title="Stores a snapshot in Postgres for trend tracking"
              >
                <CalendarClock className="mr-2 h-5 w-5" />
                Snapshot
              </Button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 mt-4"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="font-medium">Error</span>
                </div>
                <div className="mt-1 text-red-400/80">{error}</div>
              </motion.div>
            )}
          </GlowCard>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              {loading && !insights ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingGrid />
                </motion.div>
              ) : insights ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                    <h2 className="text-xl font-semibold">Performance Metrics</h2>
                  </div>
                  
                  {/* Top Metrics */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <ReadinessFlip readiness={readiness} tone={tone} />

                    <Metric
                      title="Solved"
                      color="purple"
                      value={solved?.all ?? "—"}
                      right={
                        solved
                          ? `${solved.easy}E • ${solved.medium}M • ${solved.hard}H`
                          : null
                      }
                      sub="Total accepted problems (from LeetCode profile)"
                      icon={BarChart3}
                    />

                    <Metric
                      title="Velocity"
                      color="cyan"
                      value={velocity?.perDay ?? "—"}
                      right={velocity?.perDay != null ? "problems/day" : null}
                      sub={
                        insights?.history?.snapshotCount < 2
                          ? "Take snapshots daily to unlock a true trend line"
                          : `Δ ${velocity.delta} over ${velocity.elapsedDays} days`
                      }
                      icon={TrendingUp}
                    />
                  </div>

                  {/* Tabs - Enhanced */}
                  <div className="mt-8">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="rounded-2xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-xl">
                        <TabsTrigger value="overview" className="rounded-xl text-gray-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:border-emerald-500/30">
                          <Gauge className="h-4 w-4 mr-2" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="trajectory" className="rounded-xl text-gray-400 data-[state=active]:text-cyan-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Trajectory
                        </TabsTrigger>
                        <TabsTrigger value="recommendations" className="rounded-xl text-gray-400 data-[state=active]:text-purple-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20">
                          <Target className="h-4 w-4 mr-2" />
                          Next Topics
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="rounded-xl text-gray-400 data-[state=active]:text-orange-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-yellow-500/20">
                          <Activity className="h-4 w-4 mr-2" />
                          Activity
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <GlowCard className="lg:col-span-2 p-0" glowColor="emerald">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-base text-white">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                  <Gauge className="h-4 w-4 text-emerald-400" />
                                </div>
                                Readiness Breakdown
                              </CardTitle>
                              <CardDescription className="text-gray-400">Transparent components so you can trust the score.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3 md:grid-cols-2">
                                {Object.entries(readiness?.components || {}).map(([k, v], i) => {
                                  const colors = ["border-emerald-500/20 bg-emerald-500/10", "border-purple-500/20 bg-purple-500/10", "border-cyan-500/20 bg-cyan-500/10", "border-orange-500/20 bg-orange-500/10"];
                                  const textColors = ["text-emerald-400", "text-purple-400", "text-cyan-400", "text-orange-400"];
                                  return (
                                    <div 
                                      key={k} 
                                      className={cx("rounded-xl border p-4", colors[i % colors.length])}
                                    >
                                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{k}</div>
                                      <div className="mt-3 flex items-end justify-between">
                                        <div className={cx("text-2xl font-bold", textColors[i % textColors.length])}>{v}</div>
                                        <div className="text-xs text-gray-500">{k === "recencyFactor" ? "0–1" : "/ 100"}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                                  <Brain className="h-4 w-4" />
                                  Interpretation
                                </div>
                                <div className="mt-2 text-sm text-gray-400 leading-relaxed">
                                  This dashboard optimizes for <span className="text-emerald-400 font-medium">interview outcomes</span>: it values consistent progress, broad coverage,
                                  and increasing exposure to hard problems.
                                </div>
                              </div>
                            </CardContent>
                          </GlowCard>

                          <GlowCard className="p-0" glowColor="purple">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-base text-white">
                                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                  <Rocket className="h-4 w-4 text-purple-400" />
                                </div>
                                Why LeetSight?
                              </CardTitle>
                              <CardDescription className="text-gray-400">The product advantage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {[
                                { title: "Time series tracking", desc: "Daily snapshots let you measure velocity.", icon: TrendingUp, color: "blue" },
                                { title: "Smart recommendations", desc: "Ranked by leverage × coverage gap.", icon: Target, color: "purple" },
                                { title: "Explainable scoring", desc: "Transparent and decomposed.", icon: Gauge, color: "cyan" },
                              ].map((item) => (
                                <div 
                                  key={item.title}
                                  className="group flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-3 hover:bg-background/70 hover:border-white/20 transition-all cursor-default"
                                >
                                  <div className={cx("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                    item.color === "blue" ? "from-blue-500/20 to-cyan-500/10" : 
                                    item.color === "purple" ? "from-purple-500/20 to-pink-500/10" : 
                                    "from-cyan-500/20 to-teal-500/10"
                                  )}>
                                    <item.icon className={cx("h-4 w-4",
                                      item.color === "blue" ? "text-blue-400" : 
                                      item.color === "purple" ? "text-purple-400" : 
                                      "text-cyan-400"
                                    )} />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-foreground">{item.title}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </GlowCard>
                        </div>
                      </TabsContent>

                      <TabsContent value="trajectory" className="mt-6">
                        {!historySeries.length ? (
                          <EmptyState
                            title="No history yet"
                            subtitle="Take a snapshot once per day. You’ll unlock true velocity and trendlines."
                            action={
                              <Button onClick={takeSnapshot} disabled={loading} className="rounded-xl">
                                <CalendarClock className="mr-2 h-4 w-4" />
                                Take snapshot
                              </Button>
                            }
                          />
                        ) : (
                          <div className="grid gap-4 lg:grid-cols-3">
                            <GlowCard className="lg:col-span-2 p-0" glowColor="blue">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                  </div>
                                  Solved Over Time
                                </CardTitle>
                                <CardDescription>Persisted snapshots from your analytics history.</CardDescription>
                              </CardHeader>
                              <CardContent className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={historySeries} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="all" strokeWidth={2} dot={false} stroke="url(#blueGradient)" />
                                    <defs>
                                      <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                      </linearGradient>
                                    </defs>
                                  </LineChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </GlowCard>

                            <GlowCard className="p-0" glowColor="green">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-green-400" />
                                  </div>
                                  Difficulty Mix
                                </CardTitle>
                                <CardDescription>Latest snapshot perspective.</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4">
                                  <div className="text-xs text-green-400 font-medium uppercase tracking-wider">Easy</div>
                                  <div className="mt-2 text-2xl font-bold text-green-400">{solved?.easy ?? "—"}</div>
                                </div>
                                <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4">
                                  <div className="text-xs text-yellow-400 font-medium uppercase tracking-wider">Medium</div>
                                  <div className="mt-2 text-2xl font-bold text-yellow-400">{solved?.medium ?? "—"}</div>
                                </div>
                                <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-pink-500/5 p-4">
                                  <div className="text-xs text-red-400 font-medium uppercase tracking-wider">Hard</div>
                                  <div className="mt-2 text-2xl font-bold text-red-400">{solved?.hard ?? "—"}</div>
                                </div>
                              </CardContent>
                            </GlowCard>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="recommendations" className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <GlowCard className="lg:col-span-2 p-0" glowColor="purple">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                  <Target className="h-4 w-4 text-purple-400" />
                                </div>
                                AI-Ranked Next Topics
                              </CardTitle>
                              <CardDescription>
                                Prioritized by interview leverage × coverage gap. Not random.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {nextTopics.length ? (
                                nextTopics.map((t) => (
                                  <div
                                    key={t.tagSlug}
                                    className="rounded-xl border border-white/10 bg-gradient-to-r from-background/60 to-background/40 p-4 hover:border-white/20 transition-all"
                                  >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <div className="text-sm font-semibold truncate">{t.tagName}</div>
                                          <Badge variant="secondary" className="rounded-full">
                                            opp {t.opportunity}
                                          </Badge>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          solved {t.solved} • coverage {t.coverage} • leverage {t.weight}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="secondary"
                                          className="h-9 rounded-xl bg-background/50 border-white/10 hover:bg-background/70"
                                          onClick={() => {
                                            const url = `https://leetcode.com/tag/${t.tagSlug}/`;
                                            window.open(url, "_blank");
                                          }}
                                        >
                                          <LinkIcon className="mr-2 h-4 w-4" />
                                          Tag
                                        </Button>
                                        <Button
                                          className="h-9 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                          onClick={() => {
                                            const url = `https://leetcode.com/problemset/?topicSlugs=${t.tagSlug}`;
                                            window.open(url, "_blank");
                                          }}
                                        >
                                          <ArrowUpRight className="mr-2 h-4 w-4" />
                                          Practice
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                                      {t.why?.map((w, idx) => (
                                        <div key={idx} className="rounded-xl border border-white/10 bg-background/50 p-2 text-xs text-muted-foreground">
                                          {w}
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-xs">
                                      <span className="font-medium text-purple-400">Next action:</span> <span className="text-muted-foreground">{t.nextAction}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <EmptyState
                                  title="No recommendations yet"
                                  subtitle="Once tags load, you’ll see ranked topics by leverage × coverage gap."
                                />
                              )}
                            </CardContent>
                          </GlowCard>

                          <GlowCard className="p-0" glowColor="orange">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                                  <BarChart3 className="h-4 w-4 text-orange-400" />
                                </div>
                                Top Tags
                              </CardTitle>
                              <CardDescription>Your current strength areas.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[420px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topTags} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis dataKey="name" hide />
                                  <YAxis stroke="rgba(255,255,255,0.5)" />
                                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                  <Bar dataKey="solved" fill="url(#orangeGradient)" radius={[4, 4, 0, 0]} />
                                  <defs>
                                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f97316" />
                                      <stop offset="100%" stopColor="#eab308" />
                                    </linearGradient>
                                  </defs>
                                </BarChart>
                              </ResponsiveContainer>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {topTags.slice(0, 8).map((t) => (
                                  <MiniTag key={t.name}>{t.name}</MiniTag>
                                ))}
                              </div>
                            </CardContent>
                          </GlowCard>
                        </div>
                      </TabsContent>

                      <TabsContent value="activity" className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <GlowCard className="lg:col-span-2 p-0" glowColor="cyan">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                  <Activity className="h-4 w-4 text-cyan-400" />
                                </div>
                                Recent Submissions
                              </CardTitle>
                              <CardDescription>Latest AC submissions from LeetCode.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {recentAccepted.length ? (
                                recentAccepted.slice(0, 16).map((s, i) => (
                                  <div
                                    key={`${s.slug}-${i}`}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-background/60 to-background/40 p-4 hover:border-white/20 transition-all"
                                  >
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-semibold">{s.title}</div>
                                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{s.lang}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-background/50 border border-white/10">{fmtDate(s.timestamp)}</span>
                                      </div>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      className="h-9 rounded-xl bg-background/50 border-white/10 hover:bg-background/70"
                                      onClick={() => window.open(`https://leetcode.com/problems/${s.slug}/`, "_blank")}
                                    >
                                      <ArrowUpRight className="mr-2 h-4 w-4" />
                                      Open
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <EmptyState
                                  title="No recent AC submissions found"
                                  subtitle="If your profile is private, LeetCode may limit recent activity visibility."
                                />
                              )}
                            </CardContent>
                          </GlowCard>

                          <GlowCard className="p-0" glowColor="green">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                                  <ShieldCheck className="h-4 w-4 text-green-400" />
                                </div>
                                System Status
                              </CardTitle>
                              <CardDescription>Infrastructure health signals.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3">
                                <div className="flex items-center gap-2 font-medium text-green-400">
                                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                  API Connected
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground break-all">{API_BASE}</div>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-background/50 to-background/30 p-3">
                                <div className="font-medium text-foreground">Snapshots</div>
                                <div className="mt-1 text-muted-foreground">Stored in PostgreSQL with Render Cron Jobs.</div>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-background/50 to-background/30 p-3">
                                <div className="font-medium text-foreground">Caching</div>
                                <div className="mt-1 text-muted-foreground">In-memory TTL to reduce API rate limiting.</div>
                              </div>
                            </CardContent>
                          </GlowCard>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </motion.div>
              ) : (
                <EmptyState
                  title="Enter a username to begin"
                  subtitle="This UI calls your API endpoints and visualizes readiness, trajectory, and high-ROI recommendations."
                  action={
                    <Button onClick={() => fetchAll(username, days)} className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Load
                    </Button>
                  }
                />
              )}
            </AnimatePresence>
          </div>

          {/* Premium Coming Soon Section */}
          <div className="mt-12">
            <PremiumComingSoon />
          </div>

          <footer className="mt-12 border-t border-white/10 pt-10 pb-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-purple-500/20">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-foreground">LeetSight</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Built for trajectory: velocity, breadth, leverage coverage, and explainable recommendations.
                  Make your LeetCode practice measurable, not just countable.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="http://www.linkedin.com/in/devak-mehta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="text-sm">Connect with me</span>
                  </a>
                  <a
                    href="https://github.com/devakmmm/LeetInsight"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    <span className="text-sm">Star on GitHub</span>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MiniTag>React</MiniTag>
                  <MiniTag>Tailwind</MiniTag>
                  <MiniTag>shadcn/ui</MiniTag>
                  <MiniTag>Framer Motion</MiniTag>
                  <MiniTag>Recharts</MiniTag>
                </div>
                <p className="text-xs text-muted-foreground">
                  Made with ❤️ by{" "}
                  <a
                    href="http://www.linkedin.com/in/devak-mehta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    Devak Mehta
                  </a>
                </p>
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} LeetSight. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div> 
      </div> 
    </div>
  );
}

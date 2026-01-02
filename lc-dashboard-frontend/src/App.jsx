import React, { useEffect, useMemo, useState } from "react";
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
// Animated background accents (Enhanced for SaaS look)
// ----------------------------
function AmbientAccents() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient Orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle at 30% 30%, #3b82f6, transparent 50%)" }}
        animate={{
          x: [0, 50, -20, 0],
          y: [0, 30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-44 -right-44 h-[700px] w-[700px] rounded-full blur-3xl opacity-15"
        style={{ background: "radial-gradient(circle at 70% 70%, #8b5cf6, transparent 50%)" }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -20, 35, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent 50%)" }}
        animate={{
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Gradient Lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
    </div>
  );
}

// ----------------------------
// Reusable components (Enhanced SaaS styling)
// ----------------------------
function GlowCard({ children, className, glowColor = "blue" }) {
  const glowColors = {
    blue: "group-hover:shadow-blue-500/20",
    purple: "group-hover:shadow-purple-500/20",
    cyan: "group-hover:shadow-cyan-500/20",
    green: "group-hover:shadow-green-500/20",
    orange: "group-hover:shadow-orange-500/20",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cx(
        "group relative rounded-2xl border border-white/10 bg-gradient-to-br from-background/80 to-background/40 p-4 shadow-lg backdrop-blur-xl",
        "hover:border-white/20 hover:shadow-2xl transition-all duration-300",
        glowColors[glowColor],
        className
      )}
    >
      {/* Subtle gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function Metric({ title, value, sub, icon: Icon, right, color = "blue" }) {
  const iconBgColors = {
    blue: "from-blue-500/20 to-cyan-500/10",
    purple: "from-purple-500/20 to-pink-500/10",
    green: "from-green-500/20 to-emerald-500/10",
    orange: "from-orange-500/20 to-yellow-500/10",
  };
  
  const iconColors = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    orange: "text-orange-400",
  };

  return (
    <GlowCard glowColor={color}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {Icon && <Icon className={cx("h-4 w-4", iconColors[color])} />}
            <span className="truncate font-medium">{title}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <motion.div 
              className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.div>
            {right && (
              <div className="text-sm text-muted-foreground font-medium">{right}</div>
            )}
          </div>
          {sub && (
            <div className="mt-2 text-xs text-muted-foreground/80 leading-relaxed">{sub}</div>
          )}
        </div>
        <div className={cx(
          "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
          iconBgColors[color]
        )}>
          <Sparkles className={cx("h-5 w-5", iconColors[color])} />
        </div>
      </div>
    </GlowCard>
  );
}

function ProgressRing({ value, label }) {
  const v = clamp(value, 0, 100);
  const radius = 38;
  const stroke = 8;
  const c = 2 * Math.PI * radius;
  const offset = c - (v / 100) * c;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-border"
            strokeWidth={stroke}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-foreground"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-semibold">{Math.round(v)}</div>
          <div className="text-[10px] text-muted-foreground">/ 100</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">Readiness</div>
      </div>
    </div>
  );
}

function MiniTag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <div className="rounded-2xl border bg-background/60 p-8 text-center shadow-sm backdrop-blur">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border bg-background/70">
        <Gauge className="h-5 w-5" />
      </div>
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function ReadinessFlip({ readiness, tone }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative h-full"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="w-full"
        >
          <Card className="rounded-2xl border bg-background shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <tone.icon className="h-4 w-4" />
                Readiness
              </CardTitle>
              <CardDescription>{tone.hint}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ProgressRing value={readiness?.final ?? 0} label={tone.label} />
              <div className="mt-4 text-center text-xs text-muted-foreground">Hover to learn more</div>
            </CardContent>
          </Card>
        </div>

        {/* Back */}
        <motion.div
          style={{ backfaceVisibility: "hidden", rotateY: 180 }}
          className="w-full absolute inset-0"
        >
          <Card className="rounded-2xl border bg-background shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base">What this means</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  A weighted blend of velocity, breadth, interview-leverage coverage, and hard exposure—penalized for inactivity.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <MiniTag>Velocity</MiniTag>
                  <MiniTag>Breadth</MiniTag>
                  <MiniTag>Leverage</MiniTag>
                  <MiniTag>Hard%</MiniTag>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-background/60 p-4 shadow-sm backdrop-blur">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-44" />
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
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-1.5 text-xs backdrop-blur-xl"
              >
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-foreground font-medium">LeetCode Intelligence</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Live Analytics</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="mt-5 text-4xl font-bold tracking-tight md:text-5xl"
              >
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Make practice
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  measurable.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-4 max-w-xl text-base text-muted-foreground leading-relaxed"
              >
                Transform your LeetCode grind into <span className="text-foreground font-medium">measurable trajectory</span>. 
                Track readiness, velocity, and get AI-powered topic recommendations.
              </motion.p>
              
              {/* Quick Stats Pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="mt-5 flex flex-wrap gap-2"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 border border-blue-500/20">
                  <Zap className="h-3 w-3" />
                  Real-time Sync
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400 border border-purple-500/20">
                  <Brain className="h-3 w-3" />
                  AI Insights
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 border border-cyan-500/20">
                  <Rocket className="h-3 w-3" />
                  Interview Ready
                </div>
              </motion.div>
            </div>
            <div className="w-full md:w-[380px] flex-shrink-0">
              <StreakDisplay streak={streak} />
            </div>
          </div>

          {/* Query Card - Enhanced */}
          <GlowCard className="mt-8 p-5" glowColor="purple">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Analytics Query</div>
                  <div className="text-xs text-muted-foreground">Fetch your latest LeetCode data</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-400 border-green-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                  Connected
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-white/10">
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
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
                  className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors rounded-xl"
                />
              </div>
              <div className="md:w-40">
                <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                  <SelectTrigger className="h-11 bg-background/50 border-white/10 rounded-xl">
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
                className="h-11 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-500/20 transition-all duration-300"
                disabled={loading}
              >
                <RefreshCw className={cx("mr-2 h-4 w-4", loading && "animate-spin")} />
                {loading ? "Analyzing..." : "Analyze Profile"}
              </Button>
              <Button
                onClick={takeSnapshot}
                variant="secondary"
                className="h-11 rounded-xl bg-background/50 border-white/10 hover:bg-background/70"
                disabled={loading}
                title="Stores a snapshot in Postgres for trend tracking"
              >
                <CalendarClock className="mr-2 h-4 w-4" />
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
                      color="green"
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
                      <TabsList className="rounded-2xl border border-white/10 bg-background/60 p-1.5 shadow-lg backdrop-blur-xl">
                        <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:border-white/10">
                          <Gauge className="h-4 w-4 mr-2" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="trajectory" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Trajectory
                        </TabsTrigger>
                        <TabsTrigger value="recommendations" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20">
                          <Target className="h-4 w-4 mr-2" />
                          Next Topics
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20">
                          <Activity className="h-4 w-4 mr-2" />
                          Activity
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <GlowCard className="lg:col-span-2 p-0" glowColor="cyan">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                  <Gauge className="h-4 w-4 text-cyan-400" />
                                </div>
                                Readiness Breakdown
                              </CardTitle>
                              <CardDescription>Transparent components so you can trust the score.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3 md:grid-cols-2">
                                {Object.entries(readiness?.components || {}).map(([k, v], i) => {
                                  const colors = ["from-blue-500/10 to-cyan-500/5", "from-purple-500/10 to-pink-500/5", "from-green-500/10 to-emerald-500/5", "from-orange-500/10 to-yellow-500/5"];
                                  return (
                                    <motion.div 
                                      key={k} 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      className={cx("rounded-xl border border-white/10 bg-gradient-to-br p-4", colors[i % colors.length])}
                                    >
                                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{k}</div>
                                      <div className="mt-3 flex items-end justify-between">
                                        <div className="text-2xl font-bold">{v}</div>
                                        <div className="text-xs text-muted-foreground/70">{k === "recencyFactor" ? "0–1" : "/ 100"}</div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                              <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-br from-background/50 to-background/30 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                  <Brain className="h-4 w-4 text-purple-400" />
                                  Interpretation
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                  This dashboard optimizes for <span className="text-foreground">interview outcomes</span>: it values consistent progress, broad coverage,
                                  and increasing exposure to hard problems.
                                </div>
                              </div>
                            </CardContent>
                          </GlowCard>

                          <GlowCard className="p-0" glowColor="purple">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                  <Rocket className="h-4 w-4 text-purple-400" />
                                </div>
                                Why LeetSight?
                              </CardTitle>
                              <CardDescription>The product advantage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {[
                                { title: "Time series tracking", desc: "Daily snapshots let you measure velocity.", icon: TrendingUp, color: "blue" },
                                { title: "Smart recommendations", desc: "Ranked by leverage × coverage gap.", icon: Target, color: "purple" },
                                { title: "Explainable scoring", desc: "Transparent and decomposed.", icon: Gauge, color: "cyan" },
                              ].map((item, i) => (
                                <motion.div 
                                  key={item.title}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
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
                                </motion.div>
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
                                nextTopics.map((t, i) => (
                                  <motion.div
                                    key={t.tagSlug}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: i * 0.05 }}
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
                                  </motion.div>
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
                                  <motion.div
                                    key={`${s.slug}-${i}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: i * 0.015 }}
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
                                  </motion.div>
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

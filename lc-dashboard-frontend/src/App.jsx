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
} from "lucide-react";
import { AdBanner } from "@/components/AdBanner"; // Disabled for growth phase
import { AuthPage } from "@/components/AuthPage";
import { PricingModal } from "@/components/PricingModal"; // Disabled for growth phase
import { useAuth } from "@/lib/AuthContext";

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
// Animated background accents
// ----------------------------
function AmbientAccents() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle at 30% 30%, #60a5fa, transparent 60%)" }}
        animate={{
          x: [0, 30, -10, 0],
          y: [0, 20, 10, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-44 -right-44 h-[560px] w-[560px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle at 70% 70%, #a78bfa, transparent 60%)" }}
        animate={{
          x: [0, -20, 10, 0],
          y: [0, -10, 25, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:18px_18px]" />
    </div>
  );
}

// ----------------------------
// Reusable components
// ----------------------------
function Metric({ title, value, sub, icon: Icon, right }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cx(
        "relative rounded-2xl border bg-background/60 p-4 shadow-sm backdrop-blur",
        "hover:bg-background/70 transition-colors"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            <span className="truncate">{title}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            {right ? <div className="text-sm text-muted-foreground">{right}</div> : null}
          </div>
          {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
        </div>
        <div className="h-9 w-9 rounded-xl border bg-background/70 flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
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

  const tone = useMemo(() => {
    const score = insights?.readiness?.final ?? 0;
    return readinessTone(score);
  }, [insights]);

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
    fetchAll(username, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const solved = insights?.profile?.solved;
  const readiness = insights?.readiness;
  const velocity = insights?.history?.velocity;
  const nextTopics = insights?.recommendations?.nextTopics || [];
  const recentAccepted = dashboard?.recentAccepted || [];

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

  const ToneIcon = tone.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative">
        <AmbientAccents />

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
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>LeetCode Intelligence Dashboard</span>
                <span className="opacity-60">•</span>
                <span className="opacity-80">API: {API_BASE.replace(/^https?:\/\//, "")}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Make practice measurable, not just countable.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base"
              >
                This dashboard turns LeetCode activity into trajectory: readiness, velocity, breadth, and the highest-ROI next topics—
                with explainable recommendations.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="flex flex-col gap-3 rounded-2xl border bg-background/60 p-4 shadow-sm backdrop-blur md:w-[420px]"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Query</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full">
                Render-ready
              </Badge>

              <div className="flex flex-col gap-2 md:flex-row">
                <div className="flex-1">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="LeetCode username"
                    className="h-10"
                  />
                </div>
                <div className="md:w-36">
                  <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Window" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => fetchAll(username, days)}
                  className="h-10 flex-1 rounded-xl"
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  onClick={takeSnapshot}
                  variant="secondary"
                  className="h-10 rounded-xl"
                  disabled={loading}
                  title="Stores a snapshot in Postgres"
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Snapshot
                </Button>
              </div>

              {error ? (
                <div className="rounded-xl border bg-background/70 p-3 text-xs text-destructive">
                  {error}
                </div>
              ) : null}
            </motion.div>
          </div>

          <div className="mt-8">
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
                  {/* Top Metrics */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <ReadinessFlip readiness={readiness} tone={tone} />

                    <Metric
                      title="Solved"
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

                  {/* Tabs */}
                  <div className="mt-6">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="rounded-2xl border bg-background/60 p-1 shadow-sm backdrop-blur">
                        <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
                        <TabsTrigger value="trajectory" className="rounded-xl">Trajectory</TabsTrigger>
                        <TabsTrigger value="recommendations" className="rounded-xl">Next Topics</TabsTrigger>
                        <TabsTrigger value="activity" className="rounded-xl">Activity</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur lg:col-span-2">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Gauge className="h-4 w-4" />
                                Readiness breakdown
                              </CardTitle>
                              <CardDescription>Transparent components so users trust the score.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3 md:grid-cols-2">
                                {Object.entries(readiness?.components || {}).map(([k, v]) => (
                                  <div key={k} className="rounded-2xl border bg-background/70 p-3">
                                    <div className="text-xs text-muted-foreground">{k}</div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <div className="text-lg font-semibold">{v}</div>
                                      <div className="text-xs text-muted-foreground">{k === "recencyFactor" ? "0–1" : "/ 100"}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                                <div className="font-medium text-foreground">Interpretation</div>
                                <div className="mt-1">
                                  This dashboard optimizes for interview outcomes: it values consistent progress, broad coverage of core topics,
                                  and increasing exposure to hard problems. It deprioritizes vanity streaks.
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-4 w-4" />
                                Why use this?
                              </CardTitle>
                              <CardDescription>The product moat.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                              <div className="rounded-2xl border bg-background/70 p-3">
                                <div className="font-medium text-foreground">Time series, not snapshots</div>
                                <div className="mt-1">We store daily snapshots so you can measure velocity and trajectory.</div>
                              </div>
                              <div className="rounded-2xl border bg-background/70 p-3">
                                <div className="font-medium text-foreground">Opportunity-cost recommendations</div>
                                <div className="mt-1">We rank what to do next by leverage × coverage gap.</div>
                              </div>
                              <div className="rounded-2xl border bg-background/70 p-3">
                                <div className="font-medium text-foreground">Explainable scoring</div>
                                <div className="mt-1">The readiness score is transparent and decomposed.</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="trajectory" className="mt-4">
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
                            <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur lg:col-span-2">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <TrendingUp className="h-4 w-4" />
                                  Solved over time
                                </CardTitle>
                                <CardDescription>Persisted snapshots from Postgres.</CardDescription>
                              </CardHeader>
                              <CardContent className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={historySeries} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="all" strokeWidth={2} dot={false} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <BarChart3 className="h-4 w-4" />
                                  Difficulty mix
                                </CardTitle>
                                <CardDescription>Latest snapshot perspective.</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="rounded-2xl border bg-background/70 p-4">
                                  <div className="text-xs text-muted-foreground">Easy</div>
                                  <div className="mt-1 text-xl font-semibold">{solved?.easy ?? "—"}</div>
                                </div>
                                <div className="rounded-2xl border bg-background/70 p-4">
                                  <div className="text-xs text-muted-foreground">Medium</div>
                                  <div className="mt-1 text-xl font-semibold">{solved?.medium ?? "—"}</div>
                                </div>
                                <div className="rounded-2xl border bg-background/70 p-4">
                                  <div className="text-xs text-muted-foreground">Hard</div>
                                  <div className="mt-1 text-xl font-semibold">{solved?.hard ?? "—"}</div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="recommendations" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur lg:col-span-2">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-4 w-4" />
                                Opportunity-cost ranked next topics
                              </CardTitle>
                              <CardDescription>
                                Not random. This prioritizes high interview leverage topics where your coverage is still low.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {nextTopics.length ? (
                                nextTopics.map((t) => (
                                  <motion.div
                                    key={t.tagSlug}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="rounded-2xl border bg-background/70 p-4"
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
                                          className="h-9 rounded-xl"
                                          onClick={() => {
                                            const url = `https://leetcode.com/tag/${t.tagSlug}/`;
                                            window.open(url, "_blank");
                                          }}
                                        >
                                          <LinkIcon className="mr-2 h-4 w-4" />
                                          Tag
                                        </Button>
                                        <Button
                                          className="h-9 rounded-xl"
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
                                        <div key={idx} className="rounded-xl border bg-background/80 p-2 text-xs text-muted-foreground">
                                          {w}
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-3 rounded-xl border bg-background/80 p-3 text-xs">
                                      <span className="font-medium">Next action:</span> <span className="text-muted-foreground">{t.nextAction}</span>
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
                          </Card>

                          <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-4 w-4" />
                                Top tags (solved)
                              </CardTitle>
                              <CardDescription>Quick signal of your current strengths.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[420px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topTags} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" hide />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="solved" />
                                </BarChart>
                              </ResponsiveContainer>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {topTags.slice(0, 8).map((t) => (
                                  <MiniTag key={t.name}>{t.name}</MiniTag>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="activity" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur lg:col-span-2">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4" />
                                Recent accepted submissions
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
                                    className="flex items-center justify-between gap-3 rounded-2xl border bg-background/70 p-4"
                                  >
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-semibold">{s.title}</div>
                                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <MiniTag>{s.lang}</MiniTag>
                                        <MiniTag>{fmtDate(s.timestamp)}</MiniTag>
                                      </div>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      className="h-9 rounded-xl"
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
                          </Card>

                          <Card className="rounded-2xl border bg-background/60 shadow-sm backdrop-blur">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <ShieldCheck className="h-4 w-4" />
                                System status
                              </CardTitle>
                              <CardDescription>Signals relevant to Render deployment.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                              <div className="rounded-2xl border bg-background/70 p-3">
                                <div className="font-medium text-foreground">API base</div>
                                <div className="mt-1 break-all">{API_BASE}</div>
                              </div>
                              <div className="rounded-2xl border bg-background/70 p-3">
                                <div className="font-medium text-foreground">Snapshots</div>
                                <div className="mt-1">Stored in Postgres. Use Render Cron Job later for reliability.</div>
                              </div>
                              <div className="rounded-2xl border bg-background/70 p-3">
                                <div className="font-medium text-foreground">Caching</div>
                                <div className="mt-1">In-memory TTL to reduce rate limiting during usage.</div>
                              </div>
                            </CardContent>
                          </Card>
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
                    <Button onClick={() => fetchAll(username, days)} className="rounded-xl">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Load
                    </Button>
                  }
                />
              )}
            </AnimatePresence>
          </div>

          <footer className="mt-10 border-t pt-6 text-xs text-muted-foreground">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                Built for trajectory: velocity, breadth, leverage coverage, and explainable recommendations.
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <MiniTag>React</MiniTag>
                <MiniTag>Tailwind</MiniTag>
                <MiniTag>shadcn/ui</MiniTag>
                <MiniTag>Framer Motion</MiniTag>
                <MiniTag>Recharts</MiniTag>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import {
  LogIn,
  UserPlus,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Code2,
  Sparkles,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Visual Analytics",
    description: "See your LeetCode progress through beautiful charts and graphs",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Track Velocity",
    description: "Measure your problem-solving speed and consistency over time",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Smart Recommendations",
    description: "AI-powered suggestions for your next practice topics",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Streak Tracking",
    description: "Build habits with daily streak counters and achievements",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Interview Readiness",
    description: "Know exactly when you're ready for FAANG interviews",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Time Insights",
    description: "Understand your most productive practice times",
  },
];

const steps = [
  {
    step: "1",
    title: "Connect Your Profile",
    description: "Enter your LeetCode username to sync your progress",
  },
  {
    step: "2",
    title: "Take Daily Snapshots",
    description: "Click 'Snapshot' to record your daily progress",
  },
  {
    step: "3",
    title: "Track Your Growth",
    description: "Watch your skills improve with visual analytics",
  },
];

export function AuthPage({ onSuccess }) {
  const { signup, login } = useAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHowTo, setShowHowTo] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <BackgroundBeams className="z-0" />
      <SparklesCore
        id="tsparticles"
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleCount={80}
        className="z-0"
        particleColor="#ffffff"
      />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Code2 className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                LeetSight
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Stop grinding blindly.
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Start growing smart.
              </span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-lg">
              Transform your LeetCode practice into measurable progress. 
              Track velocity, identify weak spots, and know exactly when 
              you're interview-ready.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.slice(0, 4).map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="text-green-400">{feature.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-gray-500">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-green-400">100%</div>
                <div className="text-sm text-gray-500">Free to use</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">∞</div>
                <div className="text-sm text-gray-500">Unlimited tracking</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">🔥</div>
                <div className="text-sm text-gray-500">Streak system</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                LeetSight
              </span>
            </div>

            {/* Auth Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  {isSignup ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {isSignup
                    ? "Join thousands tracking their LeetCode journey"
                    : "Continue your coding journey"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Email address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                    >
                      <X className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isSignup ? (
                        <>
                          Create Account <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Sign In <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError("");
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {isSignup
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-2 text-gray-500">New here?</span>
                </div>
              </div>

              {/* How to Use Button */}
              <button
                onClick={() => setShowHowTo(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20 transition-all"
              >
                <Sparkles className="h-4 w-4 text-green-400" />
                How to use LeetSight
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-gray-500 text-xs">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>Fast</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Free forever</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How To Use Modal */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHowTo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">How to use LeetSight</h3>
                <button
                  onClick={() => setShowHowTo(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{step.title}</h4>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Pro Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Take snapshots at the same time each day for accurate velocity tracking</li>
                  <li>• Use the recommendations tab to find your weak areas</li>
                  <li>• Build a streak to stay motivated and consistent</li>
                  <li>• Check your readiness score before scheduling interviews</li>
                </ul>
              </div>

              <Button
                onClick={() => setShowHowTo(false)}
                className="w-full mt-6 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Got it, let's go!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Links Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

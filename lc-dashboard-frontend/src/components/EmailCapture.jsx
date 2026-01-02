import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, X, Check, Sparkles, Bell, TrendingUp } from "lucide-react";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";

// Email Capture Banner (inline)
export const EmailCaptureBanner = memo(function EmailCaptureBanner({
  source = "dashboard",
  variant = "compact", // 'compact' | 'full'
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <div className="font-medium text-green-400">You're on the list!</div>
          <div className="text-sm text-gray-400">We'll notify you about new features</div>
        </div>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-10 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            {loading ? "..." : <Mail className="h-4 w-4" />}
          </Button>
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}
      </form>
    );
  }

  // Full variant
  return (
    <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-fuchsia-500/10 border border-white/10">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shrink-0">
          <Bell className="h-6 w-6 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Get Weekly Progress Reports</h3>
          <p className="text-sm text-gray-400 mb-4">
            Receive personalized insights about your LeetCode journey every week
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-11 bg-black/30 border-white/10 text-white placeholder:text-gray-500 flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 whitespace-nowrap"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
});

// Email Capture Modal
export const EmailCaptureModal = memo(function EmailCaptureModal({
  isOpen,
  onClose,
  source = "modal",
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl overflow-hidden"
      >
        {/* Gradient decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Stay in the Loop
                </h3>
                <p className="text-gray-400">
                  Be the first to know about new features, premium access, and weekly insights
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <span>Weekly progress reports</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span>Early access to premium features</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Bell className="h-5 w-5 text-fuchsia-400" />
                  <span>LeetCode tips & interview prep</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium"
                >
                  {loading ? "Subscribing..." : "Subscribe to Updates"}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="h-10 w-10 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">You're In!</h3>
              <p className="text-gray-400">Check your inbox for a confirmation</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

// Floating CTA Button (optional)
export const FloatingEmailCTA = memo(function FloatingEmailCTA({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium shadow-lg shadow-purple-500/25"
    >
      <Mail className="h-5 w-5" />
      <span>Get Updates</span>
    </motion.button>
  );
});

export default EmailCaptureBanner;

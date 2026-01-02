import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Copy,
  Check,
  Trophy,
  Plus,
  ArrowRight,
  Crown,
  X,
  Share2,
  UserPlus,
} from "lucide-react";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";

// Tier colors mapping
const TIER_COLORS = {
  Bronze: "text-amber-500",
  Silver: "text-slate-300",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-300",
  Diamond: "text-blue-300",
  Iridescent: "text-fuchsia-400",
};

const TIER_ICONS = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "💠",
  Iridescent: "👑",
};

// Create Leaderboard Modal
export const CreateLeaderboardModal = memo(function CreateLeaderboardModal({ 
  isOpen, 
  onClose, 
  username,
  onCreated 
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter a leaderboard name");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_BASE}/api/private-leaderboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), creatorUsername: username }),
      });
      const data = await res.json();
      
      if (!data.ok) throw new Error(data.error);
      
      setCreated(data.data);
      onCreated?.(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (created?.inviteLink) {
      navigator.clipboard.writeText(created.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCode = () => {
    if (created?.inviteCode) {
      navigator.clipboard.writeText(created.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {!created ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Create Private Leaderboard</h3>
                <p className="text-sm text-gray-400">Compete with friends</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Leaderboard Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., FAANG Prep Squad"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreate}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-medium"
              >
                {loading ? "Creating..." : "Create Leaderboard"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30 mx-auto mb-4">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Leaderboard Created!</h3>
              <p className="text-sm text-gray-400 mt-1">Share the invite code with your friends</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="text-xs text-gray-400 mb-2">INVITE CODE</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-purple-400 tracking-wider">
                    {created.inviteCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="text-xs text-gray-400 mb-2">INVITE LINK</div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={created.inviteLink}
                    className="flex-1 bg-transparent text-sm text-gray-300 outline-none truncate"
                  />
                  <button
                    onClick={copyLink}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-12 border-white/10 text-white hover:bg-white/5"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
});

// Join Leaderboard Modal
export const JoinLeaderboardModal = memo(function JoinLeaderboardModal({
  isOpen,
  onClose,
  username,
  initialCode = "",
  onJoined,
}) {
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Please enter an invite code");
      return;
    }
    if (!username) {
      setError("Please enter your LeetCode username first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/private-leaderboards/${code.toUpperCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcUsername: username, nickname: nickname.trim() || undefined }),
      });
      const data = await res.json();

      if (!data.ok) throw new Error(data.error);

      onJoined?.(code.toUpperCase());
      onClose();
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
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <UserPlus className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Join Leaderboard</h3>
            <p className="text-sm text-gray-400">Enter the invite code</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">
              Invite Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={6}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-mono text-lg tracking-wider text-center"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">
              Nickname (optional)
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="How should others see you?"
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <Button
            onClick={handleJoin}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium"
          >
            {loading ? "Joining..." : "Join Leaderboard"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
});

// Leaderboard View Component
export const PrivateLeaderboardView = memo(function PrivateLeaderboardView({
  code,
  onClose,
}) {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      fetchLeaderboard();
    }
  }, [code]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/private-leaderboards/${code}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setLeaderboard(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://leetsight.netlify.app/join/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
      >
        <div className="p-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-6 w-48 bg-white/10 rounded mb-2" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{leaderboard?.name}</h3>
                <p className="text-sm text-gray-400">{leaderboard?.memberCount} members</p>
              </div>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Copied!" : "Invite"}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard?.members?.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.members.map((member, idx) => (
                <div
                  key={member.username}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : idx === 1
                      ? "bg-slate-500/10 border-slate-400/30"
                      : idx === 2
                      ? "bg-amber-700/10 border-amber-700/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="w-8 text-center">
                    {idx === 0 ? (
                      <Crown className="h-6 w-6 text-yellow-400 mx-auto" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">#{member.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {member.nickname || member.username}
                      </span>
                      <span className="text-lg">{TIER_ICONS[member.tier]}</span>
                    </div>
                    {member.nickname && (
                      <div className="text-xs text-gray-500">@{member.username}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${TIER_COLORS[member.tier]}`}>
                      {member.totalSolved}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.easy}E • {member.medium}M • {member.hard}H
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No members yet. Share the invite code!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

// My Leaderboards List
export const MyLeaderboardsList = memo(function MyLeaderboardsList({
  username,
  onSelect,
  onCreate,
  onJoin,
}) {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchMyLeaderboards();
    }
  }, [username]);

  const fetchMyLeaderboards = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/private-leaderboards/user/${username}`);
      const data = await res.json();
      if (data.ok) {
        setLeaderboards(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!username) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          My Leaderboards
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={onJoin}
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Join
          </Button>
          <Button
            onClick={onCreate}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : leaderboards.length > 0 ? (
        <div className="space-y-2">
          {leaderboards.map((lb) => (
            <button
              key={lb.id}
              onClick={() => onSelect(lb.inviteCode)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all text-left"
            >
              <div>
                <div className="font-medium text-white">{lb.name}</div>
                <div className="text-xs text-gray-400">{lb.memberCount} members</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 border border-dashed border-white/10 rounded-xl">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No leaderboards yet</p>
          <p className="text-sm">Create one or join with a code</p>
        </div>
      )}
    </div>
  );
});

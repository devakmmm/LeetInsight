import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Target,
  Flame,
  Trophy,
  TrendingUp,
  Star,
  X,
  Check,
  Trash2,
  Plus,
} from "lucide-react";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";

// Goal type configurations
const GOAL_TYPES = {
  weekly_problems: {
    label: "Weekly Problems",
    icon: Target,
    color: "emerald",
    description: "Solve X problems this week",
    defaultValue: 10,
    unit: "problems",
  },
  weekly_hard: {
    label: "Weekly Hard Problems",
    icon: Flame,
    color: "red",
    description: "Solve X hard problems this week",
    defaultValue: 3,
    unit: "hard problems",
  },
  daily_streak: {
    label: "Daily Streak",
    icon: Star,
    color: "yellow",
    description: "Maintain a X-day solving streak",
    defaultValue: 7,
    unit: "day streak",
  },
  reach_tier: {
    label: "Reach Tier",
    icon: Trophy,
    color: "purple",
    description: "Reach a specific tier",
    defaultValue: "Gold",
    unit: "tier",
    options: ["Silver", "Gold", "Platinum", "Diamond", "Iridescent"],
  },
  total_problems: {
    label: "Total Problems",
    icon: TrendingUp,
    color: "cyan",
    description: "Reach X total solved problems",
    defaultValue: 100,
    unit: "problems",
  },
};

const COLOR_CLASSES = {
  emerald: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    progress: "bg-emerald-500",
  },
  red: {
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    text: "text-red-400",
    progress: "bg-red-500",
  },
  yellow: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    progress: "bg-yellow-500",
  },
  purple: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/30",
    text: "text-purple-400",
    progress: "bg-purple-500",
  },
  cyan: {
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    progress: "bg-cyan-500",
  },
};

// Goal Progress Card
const GoalCard = memo(function GoalCard({ goal, onDelete }) {
  const config = GOAL_TYPES[goal.goalType];
  const colors = COLOR_CLASSES[config.color];
  const Icon = config.icon;
  
  const progressPercent = Math.min(100, goal.progress || 0);
  const isCompleted = progressPercent >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl border ${colors.border} ${colors.bg} relative group`}
    >
      <button
        onClick={() => onDelete(goal.id)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-white flex items-center gap-2">
            {config.label}
            {isCompleted && <Check className="h-4 w-4 text-green-400" />}
          </div>
          <div className="text-sm text-gray-400">
            {goal.goalType === "reach_tier" 
              ? `Reach ${goal.targetValue} tier`
              : `${goal.currentValue || 0} / ${goal.targetValue} ${config.unit}`}
          </div>
        </div>
      </div>

      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${colors.progress} rounded-full`}
        />
      </div>
      <div className="text-right mt-1 text-xs text-gray-400">
        {progressPercent.toFixed(0)}% complete
      </div>
    </motion.div>
  );
});

// Add Goal Modal
export const AddGoalModal = memo(function AddGoalModal({
  isOpen,
  onClose,
  username,
  existingGoals = [],
  onAdded,
}) {
  const [selectedType, setSelectedType] = useState(null);
  const [targetValue, setTargetValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableTypes = Object.keys(GOAL_TYPES).filter(
    (type) => !existingGoals.some((g) => g.goalType === type)
  );

  const handleSelect = (type) => {
    setSelectedType(type);
    setTargetValue(GOAL_TYPES[type].defaultValue);
    setError("");
  };

  const handleSave = async () => {
    if (!selectedType || !targetValue) {
      setError("Please select a goal and set a target");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lcUsername: username,
          goalType: selectedType,
          targetValue: targetValue,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      onAdded?.(data.data);
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
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Target className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Set a Goal</h3>
            <p className="text-sm text-gray-400">Track your progress</p>
          </div>
        </div>

        <div className="space-y-4">
          {!selectedType ? (
            <>
              <div className="text-sm text-gray-300 mb-2">Choose a goal type:</div>
              {availableTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Check className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <p>You've set all available goals!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTypes.map((type) => {
                    const config = GOAL_TYPES[type];
                    const colors = COLOR_CLASSES[config.color];
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => handleSelect(type)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border ${colors.border} ${colors.bg} hover:brightness-110 transition-all text-left`}
                      >
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                        <div>
                          <div className="font-medium text-white">{config.label}</div>
                          <div className="text-xs text-gray-400">{config.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-sm text-gray-300 mb-2">
                Set your target for {GOAL_TYPES[selectedType].label}:
              </div>

              {GOAL_TYPES[selectedType].options ? (
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_TYPES[selectedType].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTargetValue(opt)}
                      className={`p-3 rounded-lg border transition-all ${
                        targetValue === opt
                          ? "bg-purple-500/20 border-purple-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <Input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || "")}
                  min={1}
                  className="h-12 bg-white/5 border-white/10 text-white text-center text-lg"
                />
              )}

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedType(null)}
                  variant="outline"
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white"
                >
                  {loading ? "Saving..." : "Set Goal"}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
});

// Goals Panel Component
export const GoalsPanel = memo(function GoalsPanel({
  username,
  userStats,
}) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (username) {
      fetchGoals();
    }
  }, [username]);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/goals/${username}`);
      const data = await res.json();
      if (data.ok) {
        setGoals(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await fetch(`${API_BASE}/api/goals/${goalId}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdded = (newGoal) => {
    fetchGoals(); // Refresh to get progress data
  };

  if (!username) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          My Goals
        </h3>
        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-8 text-center text-gray-400 border border-dashed border-white/10 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
        >
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No goals set</p>
          <p className="text-sm">Click to add your first goal</p>
        </button>
      )}

      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        username={username}
        existingGoals={goals}
        onAdded={handleAdded}
      />
    </div>
  );
});

export default GoalsPanel;

"use client";
import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Clock, Dumbbell, Utensils, Lock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type BlockType = "workout" | "meal" | "sleep" | "other";

interface ScheduleBlock {
  id: string;
  time: string;   // "07:00"
  type: BlockType;
  detail: string;
}

interface GeneratedPlan {
  headline: string;
  summary: string;
  totalCalories: number;
  proteinTarget: number;
  mealTimings: { time: string; meal: string; calories: number; protein: number; reason: string }[];
  workoutAdvice: { session: string; focus: string; tip: string }[];
  goalTimeline: string;
  warnings: string[];
}

const TYPE_CONFIG: Record<BlockType, { label: string; emoji: string; color: string; placeholder: string }> = {
  workout: { label: "Workout",  emoji: "💪", color: "bg-red-500/20 border-red-500/30",     placeholder: "e.g. Home workout, Gym session, Running..." },
  meal:    { label: "Meal",     emoji: "🍽️", color: "bg-emerald-500/20 border-emerald-500/30", placeholder: "e.g. Breakfast, Lunch, Dinner, Snack..." },
  sleep:   { label: "Sleep",    emoji: "😴", color: "bg-purple-500/20 border-purple-500/30",  placeholder: "Sleep time" },
  other:   { label: "Activity", emoji: "📌", color: "bg-gray-700/50 border-gray-600",         placeholder: "Other activity..." },
};

// Generate time options 12:00 AM to 11:30 PM in 30-min steps
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const period = h < 12 ? "AM" : "PM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

const TIME_OPTIONS = generateTimeOptions();
let idSeq = 0;
const uid = () => `b${Date.now()}${++idSeq}`;

const DEFAULT_BLOCKS: ScheduleBlock[] = [
  { id: uid(), time: "07:00", type: "meal",    detail: "Breakfast" },
  { id: uid(), time: "09:00", type: "workout", detail: "Morning workout" },
  { id: uid(), time: "13:00", type: "meal",    detail: "Lunch" },
  { id: uid(), time: "19:00", type: "meal",    detail: "Dinner" },
  { id: uid(), time: "23:00", type: "sleep",   detail: "Sleep" },
];

export default function CustomPlanPage() {
  const [userPlan, setUserPlan] = useState({ isPaid: false, plan: "free", isTrialActive: false });
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(DEFAULT_BLOCKS);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [expanded, setExpanded] = useState<string>("meals");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/user/plan").then(r => r.json()).then(d => {
      setUserPlan(d);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const addBlock = () => {
    setBlocks(prev => [...prev, { id: uid(), time: "12:00", type: "meal", detail: "" }]);
  };

  const updateBlock = (id: string, updates: Partial<ScheduleBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 3) { toast.error("Need at least 3 activities"); return; }
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Sort by time
  const sortedBlocks = [...blocks].sort((a, b) => a.time.localeCompare(b.time));

  const generate = async () => {
    if (!blocks.some(b => b.type === "meal")) { toast.error("Add at least one meal"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/custom-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: sortedBlocks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      setPlan(data.plan);
      toast.success("Your custom plan is ready! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!loaded) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!userPlan.isPaid && !userPlan.isTrialActive) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Custom Lifestyle Plan</h1>
        <p className="text-gray-400 mb-6">Set your daily schedule — AI creates personalized meal + workout timings around your life.</p>
        <Link href="/pricing" className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full">
          Upgrade to Pro — ₹125/month 🔥
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" /> Custom Daily Plan
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Add your workout and meal times → AI optimizes nutrition and workout advice around your schedule
        </p>
      </div>

      {/* Schedule Builder */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold">Your Daily Schedule</h2>
          <p className="text-gray-500 text-xs mt-0.5">Add workout times and meal times. Everything else is optional.</p>
        </div>

        <div className="divide-y divide-gray-800/50">
          {sortedBlocks.map((block) => {
            const cfg = TYPE_CONFIG[block.type];
            return (
              <div key={block.id} className="px-4 py-3 flex items-center gap-3 flex-wrap md:flex-nowrap">
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.color}`}>
                  <span className="text-base">{cfg.emoji}</span>
                </div>

                {/* Time picker */}
                <select
                  value={block.time}
                  onChange={e => updateBlock(block.id, { time: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 w-32 flex-shrink-0"
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>

                {/* Type selector */}
                <select
                  value={block.type}
                  onChange={e => updateBlock(block.id, { type: e.target.value as BlockType })}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 w-32 flex-shrink-0"
                >
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                  ))}
                </select>

                {/* Detail */}
                <input
                  type="text"
                  value={block.detail}
                  onChange={e => updateBlock(block.id, { detail: e.target.value })}
                  placeholder={cfg.placeholder}
                  className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                />

                {/* Delete */}
                <button
                  onClick={() => removeBlock(block.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-800">
          <button onClick={addBlock} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors group">
            <div className="w-7 h-7 rounded-lg border-2 border-dashed border-emerald-500/50 group-hover:border-emerald-400 flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Add Activity
          </button>
        </div>
      </div>

      {/* Schedule preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <p className="text-gray-400 text-sm font-medium mb-3">Your Day at a Glance</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sortedBlocks.map((b, i) => {
            const cfg = TYPE_CONFIG[b.type];
            return (
              <div key={b.id} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${cfg.color}`}>
                  <span>{cfg.emoji}</span>
                  <span className="text-white">{formatTime(b.time)}</span>
                </div>
                {i < sortedBlocks.length - 1 && <span className="text-gray-700">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={generating}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-base shadow-xl shadow-amber-500/20"
      >
        {generating ? (
          <><RefreshCw className="w-5 h-5 animate-spin" /> AI is building your plan...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Generate My Custom Plan</>
        )}
      </button>

      {/* Generated Plan */}
      {plan && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-white font-extrabold text-xl mb-2">{plan.headline}</h2>
            <p className="text-gray-300 text-sm mb-4">{plan.summary}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Daily Calories", value: `${plan.totalCalories} kcal`, color: "text-orange-400" },
                { label: "Daily Protein",  value: `${plan.proteinTarget}g`,     color: "text-emerald-400" },
                { label: "Meal Times",     value: plan.mealTimings.length,      color: "text-blue-400" },
                { label: "Workouts",       value: plan.workoutAdvice.length,    color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-900/80 rounded-xl p-3 text-center">
                  <p className={`font-bold text-lg ${color}`}>{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
            {plan.goalTimeline && (
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-sm font-semibold">🎯 {plan.goalTimeline}</p>
              </div>
            )}
          </div>

          {/* Meal timings */}
          <PlanSection id="meals" title="🍽️ Your Optimized Meal Schedule" expanded={expanded} toggle={s => setExpanded(s === expanded ? "" : s)}>
            <div className="space-y-3">
              {plan.mealTimings.map((meal, i) => (
                <div key={i} className="flex items-start gap-4 bg-gray-800/50 rounded-xl p-4">
                  <div className="text-center flex-shrink-0">
                    <p className="text-emerald-400 font-bold text-sm">{meal.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{meal.meal}</p>
                    <p className="text-gray-500 text-xs italic mt-0.5">💡 {meal.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{meal.calories} cal</p>
                    <p className="text-emerald-400 text-xs">{meal.protein}g protein</p>
                  </div>
                </div>
              ))}
            </div>
          </PlanSection>

          {/* Workout advice */}
          {plan.workoutAdvice.length > 0 && (
            <PlanSection id="workouts" title="💪 Workout Optimization" expanded={expanded} toggle={s => setExpanded(s === expanded ? "" : s)}>
              <div className="space-y-3">
                {plan.workoutAdvice.map((w, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-white font-semibold text-sm">{w.session}</p>
                    <p className="text-emerald-400 text-xs mt-1">Focus: {w.focus}</p>
                    <p className="text-gray-400 text-xs mt-1">💡 {w.tip}</p>
                  </div>
                ))}
              </div>
            </PlanSection>
          )}

          {/* Warnings */}
          {plan.warnings?.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-amber-400 font-semibold text-sm mb-2">⚠️ AI Notes</p>
              {plan.warnings.map((w, i) => <p key={i} className="text-amber-300/80 text-xs mb-1">• {w}</p>)}
            </div>
          )}

          {/* Share */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const text = `My FitAI Plan\n\n${plan.headline}\n\nMeals:\n${plan.mealTimings.map(m => `${m.time}: ${m.meal} (${m.calories} cal)`).join("\n")}`;
                navigator.clipboard.writeText(text);
                toast.success("Plan copied!");
              }}
              className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm"
            >
              📋 Copy Plan
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`My FitAI Custom Plan 💪\n\n${plan.headline}\n\nCalories: ${plan.totalCalories} kcal/day\n\nMeals:\n${plan.mealTimings.map(m => `${m.time}: ${m.meal} — ${m.calories} cal`).join("\n")}\n\nhttps://fitaipro-five.vercel.app`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors text-sm"
            >
              📲 Share
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanSection({ id, title, expanded, toggle, children }: {
  id: string; title: string; expanded: string;
  toggle: (s: string) => void; children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/30 transition-colors">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
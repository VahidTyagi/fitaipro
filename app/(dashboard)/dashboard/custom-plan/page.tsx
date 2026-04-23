"use client";
import { useState } from "react";
import {
  Plus, Trash2, Clock, Dumbbell, Utensils, Briefcase,
  Footprints, Moon, Coffee, Zap, ChevronDown, ChevronUp,
  Sparkles, Lock, RefreshCw, CheckCircle, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// ─── Types ────────────────────────────────────────
type ActivityType =
  | "wake"
  | "exercise_gym"
  | "exercise_home"
  | "meal"
  | "work"
  | "commute"
  | "walk"
  | "sleep"
  | "coffee"
  | "other";

interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  type: ActivityType;
  detail: string;
  steps?: number;
}

interface GeneratedPlan {
  summary: string;
  totalCaloriesNeeded: number;
  proteinNeeded: number;
  exerciseSummary: string;
  mealTimings: {
    time: string;
    meal: string;
    calories: number;
    protein: number;
    description: string;
    reason: string;
  }[];
  workoutAdvice: {
    session: string;
    focus: string;
    tip: string;
  }[];
  hydration: string;
  sleepAdvice: string;
  weeklyGoal: string;
  warnings: string[];
}

// ─── Activity Config ──────────────────────────────
const ACTIVITY_CONFIG: Record<ActivityType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  placeholder: string;
  hasSteps?: boolean;
}> = {
  wake:          { label: "Wake Up",         icon: Zap,       color: "text-yellow-400",  bgColor: "bg-yellow-500/20 border-yellow-500/30",  placeholder: "Morning routine, freshen up..." },
  exercise_gym:  { label: "Gym Workout",     icon: Dumbbell,  color: "text-red-400",     bgColor: "bg-red-500/20 border-red-500/30",        placeholder: "e.g. Chest + triceps, heavy weights" },
  exercise_home: { label: "Home Workout",    icon: Dumbbell,  color: "text-orange-400",  bgColor: "bg-orange-500/20 border-orange-500/30",  placeholder: "e.g. HIIT, push-pull workout" },
  meal:          { label: "Meal",            icon: Utensils,  color: "text-emerald-400", bgColor: "bg-emerald-500/20 border-emerald-500/30", placeholder: "e.g. 4 eggs + 2 roti, 250g chicken..." },
  work:          { label: "Work / Study",    icon: Briefcase, color: "text-blue-400",    bgColor: "bg-blue-500/20 border-blue-500/30",       placeholder: "Office work, meetings...", hasSteps: true },
  commute:       { label: "Commute",         icon: Footprints,color: "text-cyan-400",    bgColor: "bg-cyan-500/20 border-cyan-500/30",       placeholder: "By metro, bus, car...", hasSteps: true },
  walk:          { label: "Walk",            icon: Footprints,color: "text-teal-400",    bgColor: "bg-teal-500/20 border-teal-500/30",       placeholder: "Evening walk, morning walk...", hasSteps: true },
  sleep:         { label: "Sleep",           icon: Moon,      color: "text-purple-400",  bgColor: "bg-purple-500/20 border-purple-500/30",   placeholder: "Sleep time" },
  coffee:        { label: "Coffee / Tea",    icon: Coffee,    color: "text-amber-400",   bgColor: "bg-amber-500/20 border-amber-500/30",     placeholder: "e.g. 1 black coffee no sugar" },
  other:         { label: "Other",           icon: Clock,     color: "text-gray-400",    bgColor: "bg-gray-700/50 border-gray-600",          placeholder: "Describe activity..." },
};

const EXERCISE_TYPES: ActivityType[] = ["exercise_gym", "exercise_home"];

// ─── Helpers ──────────────────────────────────────
let idCounter = 0;
function uid() { return `block_${Date.now()}_${++idCounter}`; }

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ─── Component ────────────────────────────────────
export default function CustomPlanPage() {
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [plan, setPlan] = useState<string>("free");

  // Check plan on mount
  useState(() => {
    fetch("/api/user/plan")
      .then(r => r.json())
      .then(d => {
        setIsPaid(d.isPaid);
        setPlan(d.plan);
      })
      .catch(() => setIsPaid(false));
  });

  const [blocks, setBlocks] = useState<ScheduleBlock[]>([
    { id: uid(), startTime: "06:00", endTime: "06:30", type: "wake",         detail: "Freshen up",                    steps: 0 },
    { id: uid(), startTime: "06:30", endTime: "08:00", type: "exercise_gym", detail: "Full body gym session",          steps: 0 },
    { id: uid(), startTime: "08:00", endTime: "09:00", type: "meal",         detail: "4 eggs + 2 toast + milk",       steps: 0 },
    { id: uid(), startTime: "09:00", endTime: "10:00", type: "commute",      detail: "Office by metro",               steps: 1000 },
    { id: uid(), startTime: "10:00", endTime: "14:00", type: "work",         detail: "Office work",                   steps: 1000 },
    { id: uid(), startTime: "14:00", endTime: "15:00", type: "meal",         detail: "2 roti + 1 bowl rice + sabzi",  steps: 0 },
    { id: uid(), startTime: "15:00", endTime: "19:00", type: "work",         detail: "Office work",                   steps: 1000 },
    { id: uid(), startTime: "17:00", endTime: "17:15", type: "coffee",       detail: "1 black coffee no sugar",       steps: 0 },
    { id: uid(), startTime: "19:00", endTime: "20:00", type: "commute",      detail: "Home by metro",                 steps: 1000 },
    { id: uid(), startTime: "20:00", endTime: "21:00", type: "exercise_home",detail: "Home workout no equipment",     steps: 0 },
    { id: uid(), startTime: "21:00", endTime: "22:00", type: "meal",         detail: "250g boiled chicken + salad",   steps: 0 },
    { id: uid(), startTime: "22:00", endTime: "23:00", type: "walk",         detail: "Evening walk",                  steps: 2000 },
    { id: uid(), startTime: "23:00", endTime: "06:00", type: "sleep",        detail: "Sleep",                         steps: 0 },
  ]);

  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("meals");

  // ── Block Operations ──────────────────────────
  const addBlock = () => {
    const last = blocks[blocks.length - 1];
    setBlocks([...blocks, {
      id: uid(),
      startTime: last?.endTime || "06:00",
      endTime: last?.endTime || "07:00",
      type: "other",
      detail: "",
      steps: 0,
    }]);
  };

  const updateBlock = (id: string, updates: Partial<ScheduleBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 2) { toast.error("Need at least 2 activities"); return; }
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Validation
  const exerciseCount = blocks.filter(b => EXERCISE_TYPES.includes(b.type)).length;
  const hasExercise = exerciseCount > 0;
  const hasMeal = blocks.some(b => b.type === "meal");
  const hasSleep = blocks.some(b => b.type === "sleep");
  const tooManyExercises = exerciseCount > 3;

  // ── Generate Plan ─────────────────────────────
  const generatePlan = async () => {
    if (tooManyExercises) { toast.error("Maximum 3 exercise sessions per day"); return; }
    if (!hasMeal) { toast.error("Add at least one meal to your schedule"); return; }

    setGenerating(true);
    try {
      const res = await fetch("/api/custom-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: blocks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGeneratedPlan(data.plan);
      toast.success("Your custom plan is ready! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Locked Screen ─────────────────────────────
  if (isPaid === false) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Custom Lifestyle Plan</h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Build a plan around your exact daily schedule — wake time, gym sessions, meals,
          commute, work hours, and sleep. AI optimizes nutrition timing for your life.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 text-left space-y-2">
          {[
            "Schedule up to 3 workout sessions/day",
            "AI meal timing around your workouts",
            "Calorie targets based on your activity",
            "Indian food meal suggestions",
            "Steps & activity calorie calculation",
            "Sleep optimization advice",
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <Link
          href="/pricing"
          className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          Upgrade to Pro — ₹125/month 🔥
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Custom Lifestyle Plan
          </h1>
          <p className="text-gray-400 text-sm">
            Build your full day → AI optimizes nutrition & workout timing around your schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tooManyExercises && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Max 3 exercises/day
            </div>
          )}
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full font-semibold capitalize">
            {plan} Plan
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "Activities",  value: blocks.length,   color: "text-white" },
          { label: "Exercise",    value: `${exerciseCount}/3`, color: exerciseCount > 3 ? "text-red-400" : "text-emerald-400" },
          { label: "Meals",       value: blocks.filter(b => b.type === "meal").length,   color: "text-orange-400" },
          { label: "Total Steps", value: `${blocks.reduce((s, b) => s + (b.steps || 0), 0).toLocaleString()}`, color: "text-blue-400" },
          { label: "Sleep",       value: hasSleep ? "✓" : "—", color: hasSleep ? "text-purple-400" : "text-gray-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className={`font-bold text-lg ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Schedule Builder */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold">Your Daily Schedule</h2>
          <span className="text-gray-500 text-xs">Drag to reorder (coming soon)</span>
        </div>

        <div className="divide-y divide-gray-800/50">
          {blocks.map((block, index) => {
            const config = ACTIVITY_CONFIG[block.type];
            const Icon = config.icon;

            return (
              <div key={block.id} className="px-4 py-3 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.bgColor} border`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    {index < blocks.length - 1 && (
                      <div className="w-px h-4 bg-gray-700 mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                    {/* Time range */}
                    <div className="sm:col-span-3 flex items-center gap-1">
                      <input
                        type="time"
                        value={block.startTime}
                        onChange={e => updateBlock(block.id, { startTime: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-gray-600 text-xs flex-shrink-0">→</span>
                      <input
                        type="time"
                        value={block.endTime}
                        onChange={e => updateBlock(block.id, { endTime: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Activity type */}
                    <div className="sm:col-span-3">
                      <select
                        value={block.type}
                        onChange={e => updateBlock(block.id, { type: e.target.value as ActivityType })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {Object.entries(ACTIVITY_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Detail */}
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={block.detail}
                        onChange={e => updateBlock(block.id, { detail: e.target.value })}
                        placeholder={config.placeholder}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Steps (for walk/commute/work) */}
                    <div className="sm:col-span-1">
                      {config.hasSteps && (
                        <input
                          type="number"
                          value={block.steps || ""}
                          onChange={e => updateBlock(block.id, { steps: parseInt(e.target.value) || 0 })}
                          placeholder="Steps"
                          min={0}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>

                    {/* Delete */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add block button */}
        <div className="px-5 py-4 border-t border-gray-800">
          <button
            onClick={addBlock}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg border-2 border-dashed border-emerald-500/50 group-hover:border-emerald-400 flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Add Activity
          </button>
        </div>
      </div>

      {/* Validation warnings */}
      {tooManyExercises && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">
            You have {exerciseCount} exercise sessions. Maximum is 3 per day for recovery.
            Remove one exercise session to continue.
          </p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generatePlan}
        disabled={generating || tooManyExercises || !hasMeal}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-xl shadow-amber-500/20"
      >
        {generating ? (
          <><RefreshCw className="w-5 h-5 animate-spin" /> AI is analyzing your schedule...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Generate My Custom Plan</>
        )}
      </button>

      {!hasMeal && (
        <p className="text-center text-amber-400 text-xs">Add at least one meal to generate your plan</p>
      )}

      {/* Generated Plan */}
      {generatedPlan && <GeneratedPlanView plan={generatedPlan} expandedSection={expandedSection} setExpandedSection={setExpandedSection} />}
    </div>
  );
}

// ─── Generated Plan Display ───────────────────────
function Section({
  id, title, expanded, toggle, children
}: {
  id: string; title: string; expanded: boolean;
  toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
      >
        <h3 className="text-white font-bold">{title}</h3>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {expanded && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function GeneratedPlanView({
  plan, expandedSection, setExpandedSection
}: {
  plan: GeneratedPlan;
  expandedSection: string | null;
  setExpandedSection: (s: string | null) => void;
}) {
  const toggle = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
        <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Your Custom Plan
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{plan.summary}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Daily Calories", value: `${plan.totalCaloriesNeeded} kcal`, color: "text-orange-400" },
            { label: "Daily Protein", value: `${plan.proteinNeeded}g`, color: "text-emerald-400" },
            { label: "Exercise Sessions", value: plan.workoutAdvice.length, color: "text-red-400" },
            { label: "Meal Timings", value: plan.mealTimings.length, color: "text-blue-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900/80 rounded-xl p-3 text-center">
              <p className={`font-bold text-base ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {plan.warnings?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-1">
          <p className="text-amber-400 font-semibold text-sm mb-2">⚠️ AI Observations</p>
          {plan.warnings.map((w, i) => (
            <p key={i} className="text-amber-300/80 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{w}
            </p>
          ))}
        </div>
      )}

      {/* Meal Timings */}
      <Section id="meals" title="🍽️ Optimized Meal Timings" expanded={expandedSection === "meals"} toggle={() => toggle("meals")}>
        <div className="space-y-3">
          {plan.mealTimings.map((meal, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{meal.time}</span>
                  <h4 className="text-white font-semibold mt-1.5">{meal.meal}</h4>
                  <p className="text-gray-400 text-sm mt-0.5">{meal.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold">{meal.calories} cal</p>
                  <p className="text-emerald-400 text-xs">{meal.protein}g protein</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs italic border-t border-gray-700/50 pt-2 mt-2">
                💡 {meal.reason}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Workout Advice */}
      {plan.workoutAdvice.length > 0 && (
        <Section id="workouts" title="💪 Workout Optimization" expanded={expandedSection === "workouts"} toggle={() => toggle("workouts")}>
          <div className="space-y-3">
            {plan.workoutAdvice.map((w, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-white font-semibold mb-1">{w.session}</p>
                <p className="text-emerald-400 text-sm mb-2">Focus: {w.focus}</p>
                <p className="text-gray-400 text-xs">💡 {w.tip}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Other sections */}
      <Section id="other" title="💧 Hydration, Sleep & Goals" expanded={expandedSection === "other"} toggle={() => toggle("other")}>
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-1">💧 Hydration</p>
            <p className="text-gray-300 text-sm">{plan.hydration}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-purple-400 font-semibold text-sm mb-1">😴 Sleep Advice</p>
            <p className="text-gray-300 text-sm">{plan.sleepAdvice}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-amber-400 font-semibold text-sm mb-1">🎯 Weekly Goal</p>
            <p className="text-gray-300 text-sm">{plan.weeklyGoal}</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-4">
            <p className="text-gray-400 font-semibold text-sm mb-1">🏃 Exercise Summary</p>
            <p className="text-gray-300 text-sm">{plan.exerciseSummary}</p>
          </div>
        </div>
      </Section>

      {/* Save / Print */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            const text = `FitAI Pro Custom Plan\n\n${plan.summary}\n\nCalories: ${plan.totalCaloriesNeeded}\nProtein: ${plan.proteinNeeded}g\n\nMeals:\n${plan.mealTimings.map(m => `${m.time}: ${m.meal} (${m.calories} cal)`).join("\n")}`;
            navigator.clipboard.writeText(text);
            toast.success("Plan copied to clipboard!");
          }}
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm"
        >
          📋 Copy Plan
        </button>
        
          href={`https://wa.me/?text=${encodeURIComponent(`My Custom FitAI Plan 💪\n\nCalories: ${plan.totalCaloriesNeeded} kcal | Protein: ${plan.proteinNeeded}g\n\n${plan.summary}\n\nMeals:\n${plan.mealTimings.map(m => `${m.time}: ${m.meal} (${m.calories} cal)`).join("\n")}\n\nTry: https://fitaipro-five.vercel.app`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors text-sm"
        <a>
          📲 Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
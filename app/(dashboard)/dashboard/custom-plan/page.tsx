"use client";
import { useState, useEffect } from "react";
import {
  Sparkles, Clock, Plus, Trash2, Dumbbell, Utensils,
  Briefcase, Moon, Footprints, Coffee, ChevronDown,
  ChevronUp, Lock, RefreshCw, CheckCircle, AlertCircle,
  Target, Zap, Flame, TrendingDown, TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type ActivityType = "wake" | "exercise_gym" | "exercise_home" | "meal" | "work" |
  "commute" | "walk" | "sleep" | "coffee" | "study" | "rest" | "other";

interface Block {
  id: string;
  startTime: string;
  endTime: string;
  type: ActivityType;
  detail: string;
  steps?: number;
}

interface GeneratedPlan {
  headline: string;
  summary: string;
  totalCalories: number;
  proteinTarget: number;
  goalTimeline: string;
  estimatedWeeksToGoal: number;
  mealTimings: { time: string; meal: string; calories: number; protein: number; reason: string }[];
  workoutAdvice: { session: string; focus: string; tip: string; duration: string }[];
  hourlyTimetable: { time: string; activity: string; note: string }[];
  hydration: string;
  sleepScore: string;
  weeklyMilestone: string;
  warnings: string[];
  motivationNote: string;
}

const TYPES: Record<ActivityType, { label: string; emoji: string; color: string; hasSteps?: boolean; placeholder: string }> = {
  wake:          { label: "Wake Up",          emoji: "🌅", color: "bg-yellow-500/20 border-yellow-500/30",  placeholder: "Morning routine" },
  exercise_gym:  { label: "Gym Workout",      emoji: "🏋️", color: "bg-red-500/20 border-red-500/30",        placeholder: "e.g. Chest+Back, legs..." },
  exercise_home: { label: "Home Workout",     emoji: "💪", color: "bg-orange-500/20 border-orange-500/30",  placeholder: "e.g. HIIT, push-pull..." },
  meal:          { label: "Meal / Eat",        emoji: "🍽️", color: "bg-emerald-500/20 border-emerald-500/30",placeholder: "e.g. 4 eggs, dal roti, chicken..." },
  work:          { label: "Work / Office",     emoji: "💼", color: "bg-blue-500/20 border-blue-500/30",      placeholder: "Office, WFH...", hasSteps: true },
  commute:       { label: "Commute",           emoji: "🚇", color: "bg-cyan-500/20 border-cyan-500/30",      placeholder: "Metro, bus, car...", hasSteps: true },
  walk:          { label: "Walk",              emoji: "🚶", color: "bg-teal-500/20 border-teal-500/30",      placeholder: "Morning/evening walk...", hasSteps: true },
  sleep:         { label: "Sleep",             emoji: "😴", color: "bg-purple-500/20 border-purple-500/30",  placeholder: "Sleep time" },
  coffee:        { label: "Coffee / Tea",      emoji: "☕", color: "bg-amber-500/20 border-amber-500/30",    placeholder: "Black coffee, green tea..." },
  study:         { label: "Study",             emoji: "📚", color: "bg-indigo-500/20 border-indigo-500/30",  placeholder: "Study, reading..." },
  rest:          { label: "Rest / Relax",      emoji: "🛋️", color: "bg-gray-600/20 border-gray-600/30",     placeholder: "Break, TV, family time..." },
  other:         { label: "Other",             emoji: "📌", color: "bg-gray-700/20 border-gray-700/30",      placeholder: "Describe activity..." },
};

let idSeq = 0;
const uid = () => `b${Date.now()}${++idSeq}`;

export default function CustomPlanPage() {
  const [userPlan, setUserPlan] = useState({ isPaid: false, plan: "free", isTrialActive: false });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [expanded, setExpanded] = useState<string>("meals");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Fetch user plan and profile
    Promise.all([
      fetch("/api/user/plan").then(r => r.json()),
      fetch("/api/user/profile").then(r => r.json()),
    ]).then(([plan, profile]) => {
      setUserPlan(plan);
      setUserProfile(profile);

      // Pre-fill schedule based on their onboarding data
      const wakeTime = profile.wakeTime || "07:00";
      const sleepTime = profile.sleepTime || "23:00";
      const workoutTime = profile.preferredWorkoutTime || "morning";

      // Build a smart default schedule based on their preferences
      const defaultBlocks = buildDefaultSchedule(wakeTime, sleepTime, workoutTime, profile);
      setBlocks(defaultBlocks);
      setLoaded(true);
    }).catch(() => {
      setBlocks(buildDefaultSchedule("07:00", "23:00", "morning", {}));
      setLoaded(true);
    });
  }, []);

  function buildDefaultSchedule(wakeTime: string, sleepTime: string, workoutTime: string, profile: any): Block[] {
    const wb = [wakeTime] as string[];

    // Smart schedule builder based on workout time preference
    if (workoutTime === "morning" || workoutTime === "multiple") {
      return [
        { id: uid(), startTime: wakeTime, endTime: addHours(wakeTime, 0.5), type: "wake", detail: "Morning routine, freshen up", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 0.5), endTime: addHours(wakeTime, 2), type: profile.workoutType === "gym" ? "exercise_gym" : "exercise_home", detail: profile.workoutType === "gym" ? "Gym session" : "Morning workout", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 2), endTime: addHours(wakeTime, 3), type: "meal", detail: "Post-workout breakfast", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 4), endTime: addHours(wakeTime, 10), type: "work", detail: "Work / office", steps: 2000 },
        { id: uid(), startTime: addHours(wakeTime, 10), endTime: addHours(wakeTime, 11), type: "meal", detail: "Lunch", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 11), endTime: addHours(wakeTime, 16), type: "work", detail: "Afternoon work", steps: 1000 },
        { id: uid(), startTime: addHours(wakeTime, 16), endTime: addHours(wakeTime, 17), type: "meal", detail: "Evening snack", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 18), endTime: addHours(wakeTime, 19), type: "walk", detail: "Evening walk", steps: 3000 },
        { id: uid(), startTime: addHours(wakeTime, 20), endTime: addHours(wakeTime, 21), type: "meal", detail: "Dinner", steps: 0 },
        { id: uid(), startTime: sleepTime, endTime: wakeTime, type: "sleep", detail: "Sleep", steps: 0 },
      ];
    } else if (workoutTime === "evening" || workoutTime === "night") {
      return [
        { id: uid(), startTime: wakeTime, endTime: addHours(wakeTime, 0.5), type: "wake", detail: "Morning routine", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 0.5), endTime: addHours(wakeTime, 1.5), type: "meal", detail: "Breakfast", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 2), endTime: addHours(wakeTime, 10), type: "work", detail: "Work / office", steps: 3000 },
        { id: uid(), startTime: addHours(wakeTime, 10), endTime: addHours(wakeTime, 11), type: "meal", detail: "Lunch", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 12), endTime: addHours(wakeTime, 17), type: "work", detail: "Afternoon work", steps: 1000 },
        { id: uid(), startTime: addHours(wakeTime, 17.5), endTime: addHours(wakeTime, 19.5), type: profile.workoutType === "gym" ? "exercise_gym" : "exercise_home", detail: "Evening workout", steps: 0 },
        { id: uid(), startTime: addHours(wakeTime, 20), endTime: addHours(wakeTime, 21), type: "meal", detail: "Post-workout dinner", steps: 0 },
        { id: uid(), startTime: sleepTime, endTime: wakeTime, type: "sleep", detail: "Sleep", steps: 0 },
      ];
    }

    // Default flexible schedule
    return [
      { id: uid(), startTime: wakeTime, endTime: addHours(wakeTime, 1), type: "wake", detail: "Morning routine", steps: 0 },
      { id: uid(), startTime: addHours(wakeTime, 1), endTime: addHours(wakeTime, 2), type: "meal", detail: "Breakfast", steps: 0 },
      { id: uid(), startTime: addHours(wakeTime, 3), endTime: addHours(wakeTime, 11), type: "work", detail: "Work", steps: 3000 },
      { id: uid(), startTime: addHours(wakeTime, 11), endTime: addHours(wakeTime, 12), type: "meal", detail: "Lunch", steps: 0 },
      { id: uid(), startTime: addHours(wakeTime, 15), endTime: addHours(wakeTime, 16.5), type: profile.workoutType === "gym" ? "exercise_gym" : "exercise_home", detail: "Workout", steps: 0 },
      { id: uid(), startTime: addHours(wakeTime, 17), endTime: addHours(wakeTime, 18), type: "meal", detail: "Dinner", steps: 0 },
      { id: uid(), startTime: sleepTime, endTime: wakeTime, type: "sleep", detail: "Sleep", steps: 0 },
    ];
  }

  function addHours(time: string, hours: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + hours * 60;
    const newH = Math.floor(total / 60) % 24;
    const newM = Math.round(total % 60);
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }

  const updateBlock = (id: string, upd: Partial<Block>) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...upd } : b));

  const removeBlock = (id: string) => {
    if (blocks.length <= 3) { toast.error("Need at least 3 activities"); return; }
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const addBlock = () => {
    const last = blocks[blocks.length - 1];
    setBlocks(prev => [...prev, {
      id: uid(), startTime: last?.endTime || "12:00",
      endTime: addHours(last?.endTime || "12:00", 1),
      type: "other", detail: "", steps: 0,
    }]);
  };

  const exerciseCount = blocks.filter(b => b.type === "exercise_gym" || b.type === "exercise_home").length;
  const totalSteps = blocks.reduce((s, b) => s + (b.steps || 0), 0);
  const canGenerate = blocks.some(b => b.type === "meal") && exerciseCount <= 3;

  const generate = async () => {
    if (!canGenerate) { toast.error("Add at least one meal"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/custom-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: blocks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      setGeneratedPlan(data.plan);
      toast.success("Your personalized plan is ready! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Failed. Check API keys.");
    } finally {
      setGenerating(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userPlan.isPaid && !userPlan.isTrialActive) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Custom Lifestyle Plan</h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Build a plan around your exact schedule. AI creates timetable, workouts, and meals optimized for your life.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 text-left space-y-2">
          {["Personalized daily timetable", "Meal timing around your workouts", "Up to 3 exercise sessions/day", "Steps + calories calculated", "Goal timeline prediction", "Age & gender specific planning"].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {f}
            </div>
          ))}
        </div>
        <Link href="/pricing" className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full">
          Upgrade to Pro — ₹125/month 🔥
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" /> Custom Lifestyle Plan
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Your schedule → AI creates personalized timetable + meals + workouts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-full text-gray-300">
            💪 {exerciseCount}/3 sessions
          </span>
          <span className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-full text-gray-300">
            👣 {totalSteps.toLocaleString()} steps
          </span>
          {exerciseCount > 3 && (
            <span className="bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-full text-red-400">
              ⚠️ Max 3 exercises
            </span>
          )}
        </div>
      </div>

      {/* User's onboarding summary if available */}
      {userProfile && (userProfile.currentWeight || userProfile.goal) && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300 capitalize">{(userProfile.goal || "").replace(/_/g, " ")}</span>
          </div>
          {userProfile.currentWeight && userProfile.targetWeight && (
            <div className="flex items-center gap-2">
              {userProfile.goal === "lose_weight" ? <TrendingDown className="w-4 h-4 text-blue-400" /> : <TrendingUp className="w-4 h-4 text-orange-400" />}
              <span className="text-gray-300">{userProfile.currentWeight}kg → {userProfile.targetWeight}kg</span>
            </div>
          )}
          {userProfile.age && (
            <span className="text-gray-500 text-xs">Age {userProfile.age} · {userProfile.gender || "—"}</span>
          )}
        </div>
      )}

      {/* Schedule Builder */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold">Your Daily Schedule</h2>
          <p className="text-gray-600 text-xs">Edit times, types & details for each activity</p>
        </div>

        <div className="divide-y divide-gray-800/40">
          {blocks.map((block) => {
            const cfg = TYPES[block.type];
            return (
              <div key={block.id} className="px-4 py-3 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color} border`}>
                    <span className="text-sm">{cfg.emoji}</span>
                  </div>

                  {/* Times */}
                  <input
                    type="time"
                    value={block.startTime}
                    onChange={e => updateBlock(block.id, { startTime: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs w-24 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-gray-600 text-xs">→</span>
                  <input
                    type="time"
                    value={block.endTime}
                    onChange={e => updateBlock(block.id, { endTime: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs w-24 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Type */}
                  <select
                    value={block.type}
                    onChange={e => updateBlock(block.id, { type: e.target.value as ActivityType })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500 w-36"
                  >
                    {Object.entries(TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                  </select>

                  {/* Detail */}
                  <input
                    type="text"
                    value={block.detail}
                    onChange={e => updateBlock(block.id, { detail: e.target.value })}
                    placeholder={cfg.placeholder}
                    className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Steps for walk/commute */}
                  {cfg.hasSteps && (
                    <input
                      type="number"
                      value={block.steps || ""}
                      onChange={e => updateBlock(block.id, { steps: parseInt(e.target.value) || 0 })}
                      placeholder="Steps"
                      min={0}
                      max={50000}
                      className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                  )}

                  <button
                    onClick={() => removeBlock(block.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-800">
          <button onClick={addBlock} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={generating || !canGenerate || exerciseCount > 3}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-xl shadow-amber-500/20"
      >
        {generating ? (
          <><RefreshCw className="w-5 h-5 animate-spin" /> AI is building your plan...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Generate My Personalized Plan</>
        )}
      </button>

      {/* Generated Plan */}
      {generatedPlan && (
        <GeneratedPlanDisplay
          plan={generatedPlan}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      )}
    </div>
  );
}

function GeneratedPlanDisplay({ plan, expanded, setExpanded }: {
  plan: GeneratedPlan; expanded: string; setExpanded: (s: string) => void;
}) {
  const toggle = (s: string) => setExpanded(expanded === s ? "" : s);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-white font-extrabold text-xl">{plan.headline}</h2>
            <p className="text-gray-300 text-sm mt-1 leading-relaxed">{plan.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Daily Calories", value: `${plan.totalCalories}`, unit: "kcal", icon: Flame, color: "text-orange-400" },
            { label: "Protein Target", value: `${plan.proteinTarget}`, unit: "g/day", icon: Zap, color: "text-emerald-400" },
            { label: "Meals Planned", value: `${plan.mealTimings.length}`, unit: "meals", icon: Utensils, color: "text-blue-400" },
            { label: "Goal Timeline", value: plan.estimatedWeeksToGoal > 0 ? `${plan.estimatedWeeksToGoal}` : "∞", unit: plan.estimatedWeeksToGoal > 0 ? "weeks" : "ongoing", icon: Target, color: "text-purple-400" },
          ].map(({ label, value, unit, icon: Icon, color }) => (
            <div key={label} className="bg-gray-900/80 rounded-xl p-3 text-center">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <p className={`font-bold text-lg ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs">{unit}</p>
              <p className="text-gray-600 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Goal timeline */}
        {plan.goalTimeline && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <p className="text-emerald-400 text-sm font-semibold">🎯 {plan.goalTimeline}</p>
          </div>
        )}

        {/* Motivation */}
        {plan.motivationNote && (
          <p className="mt-3 text-gray-400 text-xs italic">💬 "{plan.motivationNote}"</p>
        )}
      </div>

      {/* Warnings */}
      {plan.warnings?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-amber-400 font-semibold text-sm mb-2">⚠️ Important Notes</p>
          {plan.warnings.map((w, i) => (
            <p key={i} className="text-amber-300/80 text-xs flex items-start gap-2 mb-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {w}
            </p>
          ))}
        </div>
      )}

      {/* Timetable */}
      {plan.hourlyTimetable?.length > 0 && (
        <PlanSection title="📅 Your Daily Timetable" id="timetable" expanded={expanded} toggle={toggle}>
          <div className="space-y-2">
            {plan.hourlyTimetable.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-emerald-400 font-bold text-xs w-16 flex-shrink-0 mt-0.5">{item.time}</span>
                <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2">
                  <p className="text-white text-sm font-medium">{item.activity}</p>
                  {item.note && <p className="text-gray-500 text-xs mt-0.5">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </PlanSection>
      )}

      {/* Meals */}
      <PlanSection title="🍽️ Meal Timings & Nutrition" id="meals" expanded={expanded} toggle={toggle}>
        <div className="space-y-3">
          {plan.mealTimings.map((meal, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{meal.time}</span>
                  <h4 className="text-white font-semibold mt-1.5 text-sm">{meal.meal}</h4>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-sm">{meal.calories} cal</p>
                  <p className="text-emerald-400 text-xs">{meal.protein}g protein</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs italic border-t border-gray-700/50 pt-2">💡 {meal.reason}</p>
            </div>
          ))}
        </div>
      </PlanSection>

      {/* Workouts */}
      {plan.workoutAdvice?.length > 0 && (
        <PlanSection title="💪 Workout Optimization" id="workouts" expanded={expanded} toggle={toggle}>
          <div className="space-y-3">
            {plan.workoutAdvice.map((w, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold text-sm">{w.session}</p>
                  <span className="text-gray-500 text-xs">{w.duration}</span>
                </div>
                <p className="text-emerald-400 text-xs mb-1">Focus: {w.focus}</p>
                <p className="text-gray-400 text-xs">💡 {w.tip}</p>
              </div>
            ))}
          </div>
        </PlanSection>
      )}

      {/* Hydration + Sleep */}
      <PlanSection title="💧 Hydration & Sleep" id="health" expanded={expanded} toggle={toggle}>
        <div className="space-y-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-xs mb-1">💧 Hydration</p>
            <p className="text-gray-300 text-sm">{plan.hydration}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-purple-400 font-semibold text-xs mb-1">😴 Sleep Score</p>
            <p className="text-gray-300 text-sm">{plan.sleepScore}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-amber-400 font-semibold text-xs mb-1">📆 Weekly Milestone</p>
            <p className="text-gray-300 text-sm">{plan.weeklyMilestone}</p>
          </div>
        </div>
      </PlanSection>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            const t = `FitAI Pro Custom Plan\n\n${plan.headline}\n\n${plan.summary}\n\nCalories: ${plan.totalCalories} | Protein: ${plan.proteinTarget}g\n\nMeals:\n${plan.mealTimings.map(m => `${m.time}: ${m.meal} — ${m.calories} cal`).join("\n")}`;
            navigator.clipboard.writeText(t);
            toast.success("Plan copied!");
          }}
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm"
        >
          📋 Copy Plan
        </button>
        
          href={`https://wa.me/?text=${encodeURIComponent(`My FitAI Custom Plan 💪\n\n${plan.headline}\n\nCalories: ${plan.totalCalories} kcal/day | Protein: ${plan.proteinTarget}g\n\nGoal: ${plan.goalTimeline}\n\nhttps://fitaipro-five.vercel.app`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors text-sm"
        <a>
          📲 Share
        </a>
      </div>
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
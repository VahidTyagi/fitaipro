"use client";
import { useState, useEffect } from "react";
import {
  Search, Zap, Clock, Flame, ChevronRight,
  CheckCircle, Trophy, RefreshCw, ChevronDown,
  ChevronUp, Play,
} from "lucide-react";
import toast from "react-hot-toast";
import ExerciseGif from "@/components/dashboard/ExerciseGif";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import RestTimer from "@/components/dashboard/RestTimer";

import WorkoutTimer from "@/components/dashboard/WorkoutTimer";

// Add state:
const [actualSeconds, setActualSeconds] = useState(0);
const [adjustedCalories, setAdjustedCalories] = useState(0);

// Body focus filters
const BODY_PARTS = ["All", "Abs", "Arms", "Chest", "Legs", "Shoulders", "Back", "Cardio"];

// Challenge cards — like the app screenshots
const CHALLENGES = [
  {
    id: "full_body_28",
    days: "28 DAYS",
    title: "FULL BODY CHALLENGE",
    desc: "Target all muscle groups and build your dream body in 4 weeks!",
    color: "from-blue-600 to-blue-800",
    type: "home_no_equipment",
    focus: "All",
  },
  {
    id: "abs_30",
    days: "30 DAYS",
    title: "GET RIPPED ABS",
    desc: "Burn belly fat and build strong abs in 30 days!",
    color: "from-teal-500 to-emerald-700",
    type: "home_no_equipment",
    focus: "Abs",
  },
  {
    id: "upper_body_28",
    days: "28 DAYS",
    title: "MASSIVE UPPER BODY",
    desc: "Sculpt your upper body — no equipment needed!",
    color: "from-slate-600 to-slate-800",
    type: "home_no_equipment",
    focus: "Chest",
  },
  {
    id: "calisthenics_28",
    days: "28 DAYS",
    title: "CALISTHENICS PLAN",
    desc: "Maximize muscle gain and fat loss with bodyweight!",
    color: "from-purple-600 to-purple-900",
    type: "home_no_equipment",
    focus: "All",
  },
];

// Preset workout plans per body focus
const PRESET_WORKOUTS: Record<string, any[]> = {
  All: [
    { id: "fw1", title: "Full Body Burn", duration: "25 mins", exercises: 12, difficulty: 2, type: "home_no_equipment", focus: "All", emoji: "🔥" },
    { id: "fw2", title: "Total Body Strength", duration: "35 mins", exercises: 15, difficulty: 3, type: "home_no_equipment", focus: "All", emoji: "💪" },
  ],
  Abs: [
    { id: "ab1", title: "Abs Beginner", duration: "15 mins", exercises: 8, difficulty: 1, type: "home_no_equipment", focus: "Abs", emoji: "⚡" },
    { id: "ab2", title: "Abs Intermediate", duration: "24 mins", exercises: 10, difficulty: 2, type: "home_no_equipment", focus: "Abs", emoji: "🎯" },
    { id: "ab3", title: "Abs Advanced", duration: "27 mins", exercises: 12, difficulty: 3, type: "home_no_equipment", focus: "Abs", emoji: "🔥" },
  ],
  Arms: [
    { id: "arm1", title: "Arm Toner", duration: "20 mins", exercises: 8, difficulty: 1, type: "home_no_equipment", focus: "Arms", emoji: "💪" },
    { id: "arm2", title: "Bigger Arms", duration: "30 mins", exercises: 10, difficulty: 2, type: "home_with_equipment", focus: "Arms", emoji: "🏋️" },
  ],
  Chest: [
    { id: "ch1", title: "Chest Beginner", duration: "20 mins", exercises: 8, difficulty: 1, type: "home_no_equipment", focus: "Chest", emoji: "💪" },
    { id: "ch2", title: "Chest Builder", duration: "30 mins", exercises: 10, difficulty: 2, type: "home_with_equipment", focus: "Chest", emoji: "🔥" },
  ],
  Legs: [
    { id: "lg1", title: "Leg Day Beginner", duration: "25 mins", exercises: 8, difficulty: 1, type: "home_no_equipment", focus: "Legs", emoji: "🦵" },
    { id: "lg2", title: "Strong Legs", duration: "35 mins", exercises: 12, difficulty: 2, type: "home_no_equipment", focus: "Legs", emoji: "💥" },
  ],
  Shoulders: [
    { id: "sh1", title: "Shoulder Sculpt", duration: "20 mins", exercises: 8, difficulty: 1, type: "home_no_equipment", focus: "Shoulders", emoji: "🏋️" },
    { id: "sh2", title: "Boulder Shoulders", duration: "30 mins", exercises: 10, difficulty: 2, type: "home_with_equipment", focus: "Shoulders", emoji: "💪" },
  ],
  Back: [
    { id: "bk1", title: "Back Beginner", duration: "20 mins", exercises: 8, difficulty: 1, type: "home_no_equipment", focus: "Back", emoji: "🔙" },
    { id: "bk2", title: "Strong Back", duration: "30 mins", exercises: 10, difficulty: 2, type: "gym", focus: "Back", emoji: "💪" },
  ],
  Cardio: [
    { id: "cd1", title: "Fat Burner", duration: "20 mins", exercises: 8, difficulty: 2, type: "home_no_equipment", focus: "Cardio", emoji: "❤️" },
    { id: "cd2", title: "HIIT Blast", duration: "25 mins", exercises: 10, difficulty: 3, type: "home_no_equipment", focus: "Cardio", emoji: "🔥" },
  ],
};

interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscle: string;
  muscleGroup: string;
  gifUrl: string | null;
  instructions: string[];
  tips: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface GeneratedWorkout {
  title: string;
  duration: number;
  calories: number;
  level: string;
  warmup: string;
  cooldown: string;
  coachTip: string;
  exercises: WorkoutExercise[];
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <Zap
          key={i}
          className={`w-4 h-4 ${i <= level ? "text-blue-500 fill-blue-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

// Today's date strip like the app
function WeekStrip({ workoutsDoneToday }: { workoutsDoneToday: boolean }) {
  const today = new Date();
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Weekly Goal</h3>
        </div>
        <span className="text-blue-600 font-bold text-base">
          {workoutsDoneToday ? 1 : 0}/6
        </span>
      </div>
      <div className="flex justify-between">
        {days.map((d, i) => {
          const isToday = i === 3;
          const isPast = i < 3;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={`text-sm font-medium ${isToday ? "text-blue-600 font-bold" : isPast ? "text-gray-400" : "text-gray-300"}`}>
                {d.getDate()}
              </span>
              {isToday ? (
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{d.getDate()}</span>
                </div>
              ) : isPast && workoutsDoneToday && i === 2 ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-xl p-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🏋️</span>
        </div>
        <p className="text-gray-700 text-sm font-medium">
          {workoutsDoneToday ? "Great job today! Keep the streak going! 🔥" : "Hi! Let's crush your goals today! 💪"}
        </p>
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState("All");
  const [generating, setGenerating] = useState(false);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState("home_no_equipment");
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [workoutsDoneToday] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(45);

  const filteredWorkouts = PRESET_WORKOUTS[selectedBodyPart] || PRESET_WORKOUTS.All;

  const generateWorkout = async (type: string, focus?: string) => {
    setGenerating(true);
    setWorkout(null);
    setWorkoutStarted(false);
    setCompletedExercises(new Set());

    try {
      const res = await fetch("/api/workout/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutType: type, bodyFocus: focus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || "Failed to generate");
      }

      const data = await res.json();
      setWorkout(data.workout);
      setWorkoutId(data.workoutId);
      setWorkoutType(type);
      toast.success("AI workout ready! 🤖💪");
    } catch (e: any) {
      toast.error(e.message || "Failed. Check API key.");
    } finally {
      setGenerating(false);
    }
  };

  // const [showRestTimer, setShowRestTimer] = useState(false);
  // const [restSeconds, setRestSeconds] = useState(45);

  const toggleExerciseDone = (key: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        sounds.exerciseDone();
        // Parse rest time and show timer
        const ex = workout?.exercises[parseInt(key.split("_").pop() || "0")];
        if (ex) {
          const restSecs = parseInt(ex.rest) || 45;
          setRestSeconds(restSecs);
          setTimeout(() => setShowRestTimer(true), 300);
        }
      }
      return next;
    });
  };

  const handleCompleteWorkout = async () => {
    if (!workoutId) return;
    setCompleting(true);
    try {
      await fetch("/api/workout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId }),
      });
      setWorkoutCompleted(true);
      toast.success("Workout completed! 🏆");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setCompleting(false);
    }
  };

  // ── COMPLETED SCREEN ──────────────────────────
  if (workoutCompleted && workout) {
    const shareText = encodeURIComponent(
      `I just crushed ${workout.title} on FitAI Pro! 💪🔥\n${workout.duration}min · ~${workout.calories}cal\n\nTry it free: https://fitaipro-five.vercel.app`
    );
    const whatsappUrl = `https://wa.me/?text=${shareText}`;
  
    return (
      <div className="max-w-lg mx-auto text-center py-12 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Workout Complete! 🎉</h1>
        <p className="text-gray-400 mb-8">{workout.duration} min · ~{workout.calories} cal burned</p>
  
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Duration", value: `${workout.duration}m`, icon: Clock },
            { label: "Calories", value: `~${workout.calories}`, icon: Flame },
            { label: "Exercises", value: workout.exercises.length, icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-white font-bold">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
  
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3 rounded-2xl mb-3 hover:bg-green-700 transition-colors"
        >
          📲 Share on WhatsApp
        </a>
  
        <button
          onClick={() => {
            setWorkout(null);
            setWorkoutStarted(false);
            setWorkoutCompleted(false);
            setCompletedExercises(new Set());
            setWorkoutId(null);
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          Do Another Workout
        </button>
      </div>
    );
  }

  // ── ACTIVE WORKOUT ────────────────────────────
  if (workoutStarted && workout) {
    const allDone = completedExercises.size >= workout.exercises.length;
    return (
      <div className="max-w-3xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{workout.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{workout.duration}min</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{workout.calories}cal</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold">{completedExercises.size}/{workout.exercises.length}</p>
            <p className="text-gray-500 text-xs">Done</p>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedExercises.size / workout.exercises.length) * 100}%` }}
          />
        </div>

        {/* Warmup */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-blue-400 text-xs font-bold mb-1">🔥 WARMUP FIRST</p>
          <p className="text-gray-300 text-sm">{workout.warmup}</p>
        </div>

        {/* AI Tip */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-emerald-400 text-xs font-bold mb-1">🤖 AI COACH</p>
          <p className="text-gray-300 text-sm italic">&quot;{workout.coachTip}&quot;</p>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {workout.exercises.map((ex, i) => {
            const key = `${ex.exerciseId}_${i}`;
            const isDone = completedExercises.has(key);
            const isOpen = activeExercise === key;

            return (
              <div key={key} className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all ${isDone ? "border-emerald-500/40" : "border-gray-800"}`}>
                <div className="flex items-center gap-3 p-4">
                  {/* Done button */}
                  <button
                    onClick={() => toggleExerciseDone(key)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone ? "bg-emerald-500" : "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-5 h-5 text-white" /> : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                  </button>

                  {/* GIF thumbnail */}
                  {ex.gifUrl && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                      <img
                        src={ex.gifUrl}
                        alt={ex.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isDone ? "text-gray-400 line-through" : "text-white"}`}>{ex.name}</p>
                    <p className="text-gray-500 text-xs">{ex.muscle}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-white font-bold text-sm">{ex.sets}×{ex.reps}</p>
                      <p className="text-gray-500 text-xs">Rest: {ex.rest}</p>
                    </div>
                    <button
                      onClick={() => setActiveExercise(isOpen ? null : key)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded — GIF + instructions */}
                {isOpen && (
                  <div className="px-4 pb-5 border-t border-gray-800 pt-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* GIF */}
                      <ExerciseGif gifUrl={ex.gifUrl} name={ex.name} muscle={ex.muscle} size="md" />

                      {/* Instructions */}
                      <div className="space-y-3">
                        {/* Mobile sets/reps */}
                        <div className="flex gap-3 sm:hidden">
                          {[
                            { label: "Sets", value: ex.sets },
                            { label: "Reps", value: ex.reps },
                            { label: "Rest", value: ex.rest },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-800 rounded-xl p-2 text-center flex-1">
                              <p className="text-white font-bold text-sm">{value}</p>
                              <p className="text-gray-500 text-xs">{label}</p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <p className="text-emerald-400 text-xs font-bold mb-2">HOW TO DO IT</p>
                          <ol className="space-y-1.5">
                            {ex.instructions.map((inst, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex gap-2">
                                <span className="text-emerald-500 font-bold flex-shrink-0">{idx + 1}.</span>
                                {inst}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {ex.tips && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                            <p className="text-amber-400 text-xs font-bold mb-1">💡 PRO TIP</p>
                            <p className="text-gray-300 text-xs">{ex.tips}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cooldown */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
          <p className="text-purple-400 text-xs font-bold mb-1">🧘 COOLDOWN</p>
          <p className="text-gray-300 text-sm">{workout.cooldown}</p>
        </div>

        {/* Complete button */}
        <button
          onClick={handleCompleteWorkout}
          disabled={completing}
          className={cn(
            "w-full font-bold py-4 rounded-2xl transition-all text-lg flex items-center justify-center gap-2",
            allDone
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              : "bg-gray-800 text-gray-400 border border-gray-700"
          )}
        >
          {completing ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Saving...</>
          ) : allDone ? (
            <><Trophy className="w-5 h-5" /> Complete Workout 🏆</>
          ) : (
            `Tick exercises as done (${completedExercises.size}/${workout.exercises.length})`
          )}
        </button>

        <button
          onClick={() => { setWorkout(null); setWorkoutStarted(false); setCompletedExercises(new Set()); }}
          className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── WORKOUT PREVIEW ───────────────────────────
  if (workout && !workoutStarted) {
    return (
      <div className="max-w-2xl space-y-5">
        <button onClick={() => setWorkout(null)} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          ← Back
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full">🤖 AI Generated</span>
              <h2 className="text-white font-extrabold text-2xl mt-2">{workout.title}</h2>
            </div>
            <button
              onClick={() => generateWorkout(workoutType)}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-xs border border-gray-700 px-3 py-2 rounded-xl transition-all"
            >
              <RefreshCw className="w-3 h-3" /> New
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Duration", value: `${workout.duration}min`, icon: Clock, color: "text-emerald-400" },
              { label: "Calories", value: `~${workout.calories}`, icon: Flame, color: "text-orange-400" },
              { label: "Level", value: workout.level, icon: Zap, color: "text-blue-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-800/50 rounded-xl p-3 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                <p className="text-white font-bold capitalize text-sm">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Coach tip */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5">
            <p className="text-emerald-400 text-xs font-bold mb-1">🤖 AI COACH</p>
            <p className="text-gray-300 text-sm italic">&quot;{workout.coachTip}&quot;</p>
          </div>

          {/* Exercise list with GIF thumbnails */}
          <div className="space-y-2 mb-6">
            {workout.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                {ex.gifUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                    <img
                      src={ex.gifUrl}
                      alt={ex.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg">💪</div>`;
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium">{ex.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{ex.muscle}</span>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">{ex.sets}×{ex.reps}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { sounds.workoutStart(); setWorkoutStarted(true); }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-lg flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> Start Workout
          </button>
        </div>
      </div>
    );
  }

  // ── GENERATING ────────────────────────────────
  if (generating) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Building your workout...</h2>
        <p className="text-gray-400 text-sm">AI is personalizing based on your goals</p>
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  

  // ── MAIN WORKOUT HOME PAGE ────────────────────
  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workouts</h1>
          <p className="text-gray-400 text-sm">All workouts free forever 💪</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search workouts, plans..."
          className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-11 pr-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
          readOnly
          onClick={() => toast("Search coming soon!")}
        />
      </div>

      {/* Weekly goal strip */}
      <WeekStrip workoutsDoneToday={workoutsDoneToday} />

      {/* Challenge cards — horizontal scroll like the app */}
      <div>
        <h2 className="text-white font-bold text-lg mb-3">Challenges</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {CHALLENGES.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => generateWorkout(challenge.type, challenge.focus)}
              className={`flex-shrink-0 w-64 bg-gradient-to-br ${challenge.color} rounded-2xl p-5 text-left relative overflow-hidden group hover:scale-105 transition-transform`}
            >
              <span className="text-white/70 text-xs font-bold tracking-wider">{challenge.days}</span>
              <h3 className="text-white font-extrabold text-xl mt-1 mb-2 leading-tight">{challenge.title}</h3>
              <p className="text-white/80 text-xs mb-4 leading-relaxed">{challenge.desc}</p>
              <div className="bg-white rounded-full py-2.5 px-5 inline-flex items-center gap-2">
                <span className={`font-bold text-sm ${challenge.color.includes("blue") ? "text-blue-600" : challenge.color.includes("teal") ? "text-teal-600" : challenge.color.includes("purple") ? "text-purple-600" : "text-gray-700"}`}>
                  START
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Body Focus filter */}
      <div>
        <h2 className="text-white font-bold text-lg mb-3">Body Focus</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {BODY_PARTS.map((part) => (
            <button
              key={part}
              onClick={() => setSelectedBodyPart(part)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBodyPart === part
                  ? "bg-blue-600 text-white border-2 border-blue-600"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400"
              }`}
            >
              {part}
            </button>
          ))}
        </div>
      </div>

      {/* Workout cards list */}
      <div className="space-y-3">
        {filteredWorkouts.map((w) => (
          <button
            key={w.id}
            onClick={() => generateWorkout(w.type, w.focus)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 dark:hover:border-emerald-500/50 hover:shadow-md transition-all text-left"
          >
            {/* Emoji thumbnail */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center flex-shrink-0 text-3xl">
              {w.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 dark:text-white font-bold text-base">{w.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{w.duration} · {w.exercises} Exercises</p>
              <DifficultyStars level={w.difficulty} />
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Quick AI Generate */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-emerald-400" />
          <p className="text-white font-semibold">Quick AI Workout</p>
        </div>
        <p className="text-gray-400 text-sm mb-4">Generate a unique workout based on your goals and today&apos;s energy level</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "🏠 Home (No Equipment)", type: "home_no_equipment" },
            { label: "🏋️ Home + Equipment", type: "home_with_equipment" },
            { label: "🏟️ Gym", type: "gym" },
          ].map(({ label, type }) => (
            <button
              key={type}
              onClick={() => generateWorkout(type)}
              className="flex-1 min-w-0 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
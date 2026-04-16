"use client";
import { sounds } from "@/lib/soundEffects";
import { useState } from "react";

import {
  Home, Dumbbell, Building2, ChevronRight,
  Clock, Flame, BarChart3, Zap, CheckCircle,
  RefreshCw, Trophy, ChevronDown, ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import ExerciseGif from "@/components/dashboard/ExerciseGif";
import { cn } from "@/lib/utils";

const workoutTypes = [
  {
    id: "home_no_equipment",
    title: "Home Workout",
    subtitle: "No Equipment Needed",
    description: "Bodyweight exercises you can do anywhere — pushups, squats, lunges, planks and more.",
    icon: Home,
    gradient: "from-emerald-500 to-teal-500",
    tag: "Most Popular",
    tagColor: "bg-emerald-500/20 text-emerald-400",
  },
  {
    id: "home_with_equipment",
    title: "Home + Equipment",
    subtitle: "Dumbbells & Resistance Bands",
    description: "Level up your home workouts with basic equipment for more variety and resistance.",
    icon: Dumbbell,
    gradient: "from-blue-500 to-cyan-500",
    tag: "Recommended",
    tagColor: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "gym",
    title: "Gym Workout",
    subtitle: "Full Gym Access",
    description: "Complete gym programs using machines, barbells, cables, and free weights.",
    icon: Building2,
    gradient: "from-purple-500 to-pink-500",
    tag: "Advanced",
    tagColor: "bg-purple-500/20 text-purple-400",
  },
];

interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscle: string;
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

export default function WorkoutPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  const generateWorkout = async (type: string) => {
    setGenerating(true);
    setSelectedType(type);
    setWorkout(null);

    try {
      const res = await fetch("/api/workout/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutType: type }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setWorkout(data.workout);
      setWorkoutId(data.workoutId);
      toast.success("AI workout generated! 🤖💪");
    } catch {
      toast.error("Failed to generate workout. Check your API key.");
      setSelectedType(null);
    } finally {
      setGenerating(false);
    }
  };

  const toggleExerciseDone = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
        sounds.exerciseDone(); // ← add this
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
      sounds.workoutComplete();
      toast.success("Workout completed! Great job! 🏆");
    } catch {
      toast.error("Failed to save completion");
    } finally {
      setCompleting(false);
    }
  };

  // ── COMPLETION SCREEN ──────────────────────────────────────
  if (workoutCompleted && workout) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Workout Complete! 🎉</h1>
        <p className="text-gray-400 mb-8">
          You crushed {workout.title} — {workout.duration} min, ~{workout.calories} calories burned
        </p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Duration", value: `${workout.duration}m`, icon: Clock },
            { label: "Calories", value: `~${workout.calories}`, icon: Flame },
            { label: "Exercises", value: workout.exercises.length, icon: Dumbbell },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-white font-bold">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setWorkout(null);
            setSelectedType(null);
            setWorkoutStarted(false);
            setWorkoutCompleted(false);
            setCompletedExercises(new Set());
            setWorkoutId(null);
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          Do Another Workout
        </button>
      </div>
    );
  }

  // ── ACTIVE WORKOUT SCREEN ──────────────────────────────────
  if (workoutStarted && workout) {
    const allDone = completedExercises.size >= workout.exercises.length;

    return (
      <div className="max-w-3xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{workout.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {workout.duration} min</span>
              <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {workout.calories} cal</span>
              <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {workout.level}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold text-lg">
              {completedExercises.size}/{workout.exercises.length}
            </p>
            <p className="text-gray-500 text-xs">Done</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedExercises.size / workout.exercises.length) * 100}%` }}
          />
        </div>

        {/* Warmup */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-blue-400 text-xs font-semibold mb-1">🔥 WARMUP FIRST</p>
          <p className="text-gray-300 text-sm">{workout.warmup}</p>
        </div>

        {/* AI Coach Tip */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-emerald-400 text-xs font-semibold mb-1">🤖 AI COACH</p>
          <p className="text-gray-300 text-sm">&quot;{workout.coachTip}&quot;</p>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {workout.exercises.map((ex, i) => {
            const isDone = completedExercises.has(ex.exerciseId + i);
            const isExpanded = activeExercise === ex.exerciseId + i;

            return (
              <div
                key={ex.exerciseId + i}
                className={cn(
                  "bg-gray-900 border rounded-2xl overflow-hidden transition-all",
                  isDone
                    ? "border-emerald-500/40 opacity-75"
                    : "border-gray-800 hover:border-gray-700"
                )}
              >
                {/* Exercise Header */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => toggleExerciseDone(ex.exerciseId + i)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      isDone
                        ? "bg-emerald-500"
                        : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-gray-400 font-bold text-sm">{i + 1}</span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold", isDone ? "text-gray-400 line-through" : "text-white")}>
                      {ex.name}
                    </p>
                    <p className="text-gray-500 text-xs">{ex.muscle}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-white font-bold">{ex.sets}</p>
                      <p className="text-gray-500 text-xs">Sets</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-white font-bold">{ex.reps}</p>
                      <p className="text-gray-500 text-xs">Reps</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-white font-bold">{ex.rest}</p>
                      <p className="text-gray-500 text-xs">Rest</p>
                    </div>
                    <button
                      onClick={() => setActiveExercise(isExpanded ? null : ex.exerciseId + i)}
                      className="text-gray-400 hover:text-white transition-colors ml-2"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded — GIF + Instructions */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                    <ExerciseGif gifUrl={ex.gifUrl} name={ex.name} muscle={ex.muscle} />
                      <div className="space-y-3">
                        <div>
                          <p className="text-emerald-400 text-xs font-semibold mb-2">HOW TO DO IT</p>
                          <ol className="space-y-1">
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
                            <p className="text-amber-400 text-xs font-semibold mb-1">💡 PRO TIP</p>
                            <p className="text-gray-300 text-xs">{ex.tips}</p>
                          </div>
                        )}
                        {ex.notes && (
                          <p className="text-gray-400 text-xs italic">{ex.notes}</p>
                        )}
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
          <p className="text-purple-400 text-xs font-semibold mb-1">🧘 COOLDOWN</p>
          <p className="text-gray-300 text-sm">{workout.cooldown}</p>
        </div>

        {/* Complete Button */}
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
            `Mark exercises done (${completedExercises.size}/${workout.exercises.length})`
          )}
        </button>

        <button
          onClick={() => { setWorkout(null); setSelectedType(null); setWorkoutStarted(false); setCompletedExercises(new Set()); }}
          className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
        >
          ← Back to workout selection
        </button>
      </div>
    );
  }

  // ── WORKOUT PREVIEW ────────────────────────────────────────
  if (workout && !workoutStarted) {
    return (
      <div className="max-w-2xl space-y-5">
        <button
          onClick={() => { setWorkout(null); setSelectedType(null); }}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          ← Back to workout types
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                🤖 AI Generated
              </span>
              <h2 className="text-white font-extrabold text-2xl mt-2">{workout.title}</h2>
            </div>
            <button
              onClick={() => generateWorkout(selectedType!)}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-2 rounded-xl transition-all hover:border-gray-500"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Duration", value: `${workout.duration} min`, icon: Clock, color: "text-emerald-400" },
              { label: "Calories", value: `~${workout.calories}`, icon: Flame, color: "text-orange-400" },
              { label: "Level", value: workout.level, icon: BarChart3, color: "text-blue-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-800/50 rounded-xl p-4 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                <p className="text-white font-bold capitalize">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Coach Tip */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <p className="text-emerald-400 text-xs font-semibold mb-1">🤖 AI COACH</p>
            <p className="text-gray-300 text-sm italic">&quot;{workout.coachTip}&quot;</p>
          </div>

          {/* Exercise Preview */}
          <div className="space-y-2 mb-6">
            {workout.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium">{ex.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{ex.muscle}</span>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">
                  {ex.sets} × {ex.reps}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { sounds.workoutStart(); setWorkoutStarted(true); }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" /> Start Workout
          </button>
        </div>
      </div>
    );
  }

  // ── GENERATING STATE ───────────────────────────────────────
  if (generating) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">AI is building your workout...</h2>
        <p className="text-gray-400">Personalizing based on your goal, level, and history</p>
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── TYPE SELECTION ─────────────────────────────────────────
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Choose Your Workout</h1>
        <p className="text-gray-400">
          All workout types are free forever. AI generates a personalized plan just for you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {workoutTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => generateWorkout(type.id)}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${type.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-bold">{type.title}</h3>
                  <p className="text-gray-500 text-xs">{type.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors mt-0.5" />
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{type.description}</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${type.tagColor}`}>
                {type.tag}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-1">How AI Workouts Work</p>
            <p className="text-gray-400 text-sm">
              Every time you tap a workout type, our AI creates a unique plan based on your goal, fitness level, and training history. No two workouts are the same. GIF demonstrations show you exactly how to do each exercise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
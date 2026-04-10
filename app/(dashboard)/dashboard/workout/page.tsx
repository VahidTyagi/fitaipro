"use client";
import { useState } from "react";
import { Home, Dumbbell, Building2, ChevronRight, Clock, Flame, BarChart3 } from "lucide-react";
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

const sampleWorkouts: Record<string, any> = {
  home_no_equipment: {
    title: "Bodyweight Power",
    duration: 35,
    calories: 280,
    level: "Intermediate",
    exercises: [
      { name: "Warm Up — Jumping Jacks", sets: 1, reps: "2 min", rest: "30s", muscle: "Full Body" },
      { name: "Push Ups", sets: 4, reps: "12-15", rest: "45s", muscle: "Chest, Triceps" },
      { name: "Bodyweight Squats", sets: 4, reps: "20", rest: "45s", muscle: "Quads, Glutes" },
      { name: "Mountain Climbers", sets: 3, reps: "30s", rest: "30s", muscle: "Core, Cardio" },
      { name: "Reverse Lunges", sets: 3, reps: "12 each leg", rest: "45s", muscle: "Quads, Hamstrings" },
      { name: "Plank Hold", sets: 3, reps: "45s", rest: "30s", muscle: "Core" },
      { name: "Burpees", sets: 3, reps: "10", rest: "60s", muscle: "Full Body" },
      { name: "Cool Down — Stretching", sets: 1, reps: "5 min", rest: "—", muscle: "Full Body" },
    ],
  },
  home_with_equipment: {
    title: "Dumbbell Strength",
    duration: 45,
    calories: 320,
    level: "Intermediate",
    exercises: [
      { name: "Warm Up", sets: 1, reps: "5 min", rest: "—", muscle: "Full Body" },
      { name: "Dumbbell Bench Press", sets: 4, reps: "10-12", rest: "60s", muscle: "Chest" },
      { name: "Dumbbell Rows", sets: 4, reps: "12 each", rest: "60s", muscle: "Back, Biceps" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "12", rest: "60s", muscle: "Shoulders" },
      { name: "Goblet Squats", sets: 4, reps: "15", rest: "60s", muscle: "Quads, Glutes" },
      { name: "Romanian Deadlifts", sets: 3, reps: "12", rest: "60s", muscle: "Hamstrings" },
      { name: "Bicep Curls", sets: 3, reps: "12", rest: "45s", muscle: "Biceps" },
      { name: "Tricep Kickbacks", sets: 3, reps: "12", rest: "45s", muscle: "Triceps" },
    ],
  },
  gym: {
    title: "Gym Push Day",
    duration: 55,
    calories: 400,
    level: "Intermediate",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: "90s", muscle: "Chest" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "75s", muscle: "Upper Chest" },
      { name: "Cable Flyes", sets: 3, reps: "12-15", rest: "60s", muscle: "Chest" },
      { name: "Overhead Press", sets: 4, reps: "8-10", rest: "90s", muscle: "Shoulders" },
      { name: "Lateral Raises", sets: 3, reps: "15", rest: "45s", muscle: "Side Delts" },
      { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: "60s", muscle: "Triceps" },
      { name: "Skull Crushers", sets: 3, reps: "10-12", rest: "60s", muscle: "Triceps" },
    ],
  },
};

export default function WorkoutPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  const workout = selectedType ? sampleWorkouts[selectedType] : null;

  if (workoutStarted && workout) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{workout.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Clock className="w-4 h-4" /> {workout.duration} min
              </span>
              <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Flame className="w-4 h-4" /> {workout.calories} cal
              </span>
              <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                <BarChart3 className="w-4 h-4" /> {workout.level}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setWorkoutStarted(false); setSelectedType(null); }}
            className="text-gray-400 hover:text-white text-sm border border-gray-700 px-4 py-2 rounded-xl transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* AI Coach Tip */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-emerald-400 text-xs font-semibold mb-1">🤖 AI COACH TIP</p>
          <p className="text-gray-300 text-sm">
            Focus on proper form over weight/reps. Rest fully between sets. Stay hydrated!
          </p>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {workout.exercises.map((ex: any, i: number) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{ex.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{ex.muscle}</p>
              </div>
              <div className="flex items-center gap-6 text-sm flex-shrink-0">
                <div className="text-center">
                  <p className="text-white font-bold">{ex.sets}</p>
                  <p className="text-gray-500 text-xs">Sets</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{ex.reps}</p>
                  <p className="text-gray-500 text-xs">Reps</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{ex.rest}</p>
                  <p className="text-gray-500 text-xs">Rest</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Button */}
        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all text-lg mt-4">
          ✅ Complete Workout
        </button>
      </div>
    );
  }

  if (selectedType && workout) {
    return (
      <div className="max-w-2xl space-y-6">
        <button
          onClick={() => setSelectedType(null)}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          ← Back to workout types
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-xl">{workout.title}</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full">
              AI Generated
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-white font-bold">{workout.duration} min</p>
              <p className="text-gray-500 text-xs">Duration</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-white font-bold">{workout.calories}</p>
              <p className="text-gray-500 text-xs">Calories</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold">{workout.level}</p>
              <p className="text-gray-500 text-xs">Level</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            {workout.exercises.length} exercises · Tap Start to begin
          </p>

          <button
            onClick={() => setWorkoutStarted(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-lg"
          >
            Start Workout 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Choose Your Workout</h1>
        <p className="text-gray-400">All workout types are free forever. Pick what suits you today.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {workoutTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                "group bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all",
                selectedType === type.id && "border-emerald-500 bg-emerald-500/5"
              )}
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
        <p className="text-emerald-400 font-semibold text-sm mb-1">
          🤖 AI Coach coming soon
        </p>
        <p className="text-gray-400 text-sm">
          In the next update, your AI coach will generate fully personalized workouts based on your goals, level, and past performance with GIF demonstrations for every exercise.
        </p>
      </div>
    </div>
  );
}
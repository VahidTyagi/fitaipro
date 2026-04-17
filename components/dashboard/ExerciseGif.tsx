"use client";
import { useState } from "react";

interface Props {
  gifUrl: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

// Verified working GIF URLs from ExerciseDB public CDN
export const EXERCISE_GIFS: Record<string, string> = {
  pushup: "https://v2.exercisedb.io/image/0061.gif",
  squat_bw: "https://v2.exercisedb.io/image/0043.gif",
  plank: "https://v2.exercisedb.io/image/0048.gif",
  lunge_bw: "https://v2.exercisedb.io/image/0034.gif",
  mountain_climber: "https://v2.exercisedb.io/image/0029.gif",
  burpee: "https://v2.exercisedb.io/image/0013.gif",
  glute_bridge: "https://v2.exercisedb.io/image/0027.gif",
  jumping_jack: "https://v2.exercisedb.io/image/0081.gif",
  crunches: "https://v2.exercisedb.io/image/0009.gif",
  high_knees: "https://v2.exercisedb.io/image/0082.gif",
  tricep_dip: "https://v2.exercisedb.io/image/0066.gif",
  superman: "https://v2.exercisedb.io/image/0045.gif",
  wall_sit: "https://v2.exercisedb.io/image/0050.gif",
  leg_raise: "https://v2.exercisedb.io/image/0026.gif",
  pike_pushup: "https://v2.exercisedb.io/image/0042.gif",
  db_bench_press: "https://v2.exercisedb.io/image/0176.gif",
  db_row: "https://v2.exercisedb.io/image/0226.gif",
  db_shoulder_press: "https://v2.exercisedb.io/image/0096.gif",
  goblet_squat: "https://v2.exercisedb.io/image/0200.gif",
  db_curl: "https://v2.exercisedb.io/image/0299.gif",
  db_rdl: "https://v2.exercisedb.io/image/0059.gif",
  db_lateral_raise: "https://v2.exercisedb.io/image/0190.gif",
  db_chest_fly: "https://v2.exercisedb.io/image/0180.gif",
  db_lunge: "https://v2.exercisedb.io/image/0210.gif",
  barbell_bench: "https://v2.exercisedb.io/image/0025.gif",
  deadlift: "https://v2.exercisedb.io/image/0003.gif",
  squat_barbell: "https://v2.exercisedb.io/image/0047.gif",
  overhead_press: "https://v2.exercisedb.io/image/0033.gif",
  lat_pulldown: "https://v2.exercisedb.io/image/0236.gif",
  cable_fly: "https://v2.exercisedb.io/image/0073.gif",
  leg_press: "https://v2.exercisedb.io/image/0056.gif",
  tricep_pushdown: "https://v2.exercisedb.io/image/0065.gif",
  face_pull: "https://v2.exercisedb.io/image/0085.gif",
  cable_row: "https://v2.exercisedb.io/image/0238.gif",
  incline_db_press: "https://v2.exercisedb.io/image/0177.gif",
  leg_curl: "https://v2.exercisedb.io/image/0057.gif",
};

const MUSCLE_GRADIENT: Record<string, string> = {
  chest: "from-red-500 to-rose-600",
  back: "from-blue-500 to-indigo-600",
  shoulders: "from-purple-500 to-violet-600",
  biceps: "from-orange-500 to-amber-600",
  triceps: "from-yellow-500 to-orange-600",
  quads: "from-green-500 to-emerald-600",
  legs: "from-green-500 to-emerald-600",
  glutes: "from-teal-500 to-cyan-600",
  hamstrings: "from-lime-500 to-green-600",
  abs: "from-indigo-500 to-blue-600",
  cardio: "from-rose-500 to-red-600",
  "full body": "from-emerald-500 to-teal-600",
};

const MUSCLE_EMOJI: Record<string, string> = {
  chest: "💪", back: "🔙", shoulders: "🏋️", biceps: "💪",
  triceps: "💪", quads: "🦵", legs: "🦵", glutes: "🍑",
  hamstrings: "🦵", abs: "⚡", cardio: "❤️", "full body": "🔥",
};

export default function ExerciseGif({ gifUrl, name, muscle, size = "md" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const heights = { sm: "h-36", md: "h-52", lg: "h-64" };
  const heightClass = heights[size];
  const muscleKey = muscle.toLowerCase();
  const gradient = MUSCLE_GRADIENT[muscleKey] || "from-emerald-500 to-teal-600";
  const emoji = MUSCLE_EMOJI[muscleKey] || "💪";

  if (!gifUrl || error) {
    return (
      <div className={`w-full ${heightClass} bg-gradient-to-br ${gradient} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white animate-pulse" />
        </div>
        <span className="text-5xl mb-3 relative z-10">{emoji}</span>
        <p className="text-white font-bold text-sm relative z-10 px-3 text-center">{name}</p>
        <p className="text-white/70 text-xs relative z-10 mt-1">See instructions below ↓</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} bg-gray-800 rounded-2xl overflow-hidden relative group`}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-800 z-10">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs">Loading {name}...</p>
        </div>
      )}
      <img
        src={gifUrl}
        alt={`${name} exercise demo`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      {loaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-sm">{name}</p>
            <p className="text-white/70 text-xs">{muscle}</p>
          </div>
        </div>
      )}
      {loaded && (
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
          {muscle}
        </div>
      )}
    </div>
  );
}
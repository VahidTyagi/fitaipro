"use client";
import { useState } from "react";

interface Props {
  gifUrl: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

const MUSCLE_EMOJI: Record<string, string> = {
  chest: "💪", back: "🔙", shoulders: "🏋️", biceps: "💪",
  triceps: "💪", legs: "🦵", glutes: "🍑", abs: "⚡",
  cardio: "❤️", "full body": "🔥", hamstrings: "🦵",
  quads: "🦵",
};

const MUSCLE_GRADIENT: Record<string, string> = {
  chest: "from-red-500 to-pink-500",
  back: "from-blue-500 to-indigo-500",
  shoulders: "from-purple-500 to-violet-500",
  biceps: "from-orange-500 to-amber-500",
  triceps: "from-yellow-500 to-orange-500",
  legs: "from-green-500 to-emerald-500",
  quads: "from-green-500 to-emerald-500",
  glutes: "from-teal-500 to-cyan-500",
  abs: "from-indigo-500 to-blue-500",
  cardio: "from-rose-500 to-red-500",
  "full body": "from-emerald-500 to-teal-500",
  hamstrings: "from-lime-500 to-green-500",
};

export default function ExerciseGif({ gifUrl, name, muscle, size = "md" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const heightClass = { sm: "h-36", md: "h-52", lg: "h-64" }[size];
  const muscleKey = muscle.toLowerCase();
  const emoji = MUSCLE_EMOJI[muscleKey] || "💪";
  const gradient = MUSCLE_GRADIENT[muscleKey] || "from-emerald-500 to-teal-500";

  if (!gifUrl || error) {
    return (
      <div className={`w-full ${heightClass} bg-gradient-to-br ${gradient} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-32 h-32 rounded-full bg-white animate-ping" />
        </div>
        <span className="text-5xl mb-3 relative z-10">{emoji}</span>
        <p className="text-white font-bold text-sm relative z-10 px-3 text-center">{name}</p>
        <p className="text-white/70 text-xs relative z-10 mt-1">Follow instructions ↓</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} bg-gray-800 rounded-2xl overflow-hidden relative`}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-800 z-10">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs">Loading {name}...</p>
        </div>
      )}
      <img
        src={gifUrl}
        alt={`${name} exercise demonstration`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      {loaded && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {muscle}
        </div>
      )}
    </div>
  );
}
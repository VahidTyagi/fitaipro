"use client";
import { useState, useEffect } from "react";
import { EXERCISE_GIF_URLS } from "@/lib/exercise-gifs";

interface Props {
  exerciseId?: string;
  gifUrl?: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

const MUSCLE_STYLE: Record<string, { gradient: string; emoji: string }> = {
  chest:      { gradient: "from-red-500 to-rose-700",      emoji: "💪" },
  back:       { gradient: "from-blue-500 to-indigo-700",   emoji: "🔙" },
  shoulders:  { gradient: "from-purple-500 to-violet-700", emoji: "🏋️" },
  biceps:     { gradient: "from-orange-500 to-amber-700",  emoji: "💪" },
  triceps:    { gradient: "from-yellow-500 to-orange-600", emoji: "💪" },
  quads:      { gradient: "from-green-500 to-emerald-700", emoji: "🦵" },
  legs:       { gradient: "from-green-500 to-teal-700",    emoji: "🦵" },
  glutes:     { gradient: "from-pink-500 to-rose-700",     emoji: "🍑" },
  hamstrings: { gradient: "from-lime-500 to-green-700",    emoji: "🦵" },
  abs:        { gradient: "from-indigo-500 to-blue-700",   emoji: "⚡" },
  cardio:     { gradient: "from-rose-500 to-red-700",      emoji: "❤️" },
  "full body":{ gradient: "from-emerald-500 to-teal-700",  emoji: "🔥" },
};

function FallbackCard({ name, muscle, size }: { name: string; muscle: string; size: string }) {
  const [frame, setFrame] = useState(0);
  const style = MUSCLE_STYLE[muscle.toLowerCase()] || { gradient: "from-emerald-500 to-teal-700", emoji: "💪" };
  const h = { sm: "h-36", md: "h-52", lg: "h-64" }[size] || "h-52";
  const scales = ["scale-100", "scale-110", "scale-125", "scale-110"];

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 4), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`w-full ${h} bg-gradient-to-br ${style.gradient} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden select-none`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-28 h-28 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute w-20 h-20 rounded-full bg-white/10 animate-pulse" />
      </div>
      <span className={`text-5xl mb-2 relative z-10 transition-transform duration-300 ${scales[frame]}`}>
        {style.emoji}
      </span>
      <p className="text-white font-bold text-sm relative z-10 px-3 text-center">{name}</p>
      <p className="text-white/70 text-xs relative z-10 mt-1">See instructions ↓</p>
    </div>
  );
}

export default function ExerciseGif({ exerciseId, gifUrl, name, muscle, size = "md" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  const h = { sm: "h-36", md: "h-52", lg: "h-64" }[size] || "h-52";

  // Priority: exercise-gifs.ts URL > local /gifs/ > gifUrl from exercises.ts
  const primaryUrl = exerciseId ? EXERCISE_GIF_URLS[exerciseId] : null;
  const localUrl   = exerciseId ? `/gifs/${exerciseId}.gif` : null;
  const fallbackUrl = gifUrl || null;

  const [src, setSrc] = useState<string | null>(primaryUrl || localUrl || fallbackUrl);

  useEffect(() => {
    const newSrc = primaryUrl || localUrl || fallbackUrl;
    setSrc(newSrc);
    setLoaded(false);
    setError(false);
    setTriedFallback(false);
  }, [exerciseId, gifUrl]);

  const handleError = () => {
    if (!triedFallback && fallbackUrl && src !== fallbackUrl) {
      setTriedFallback(true);
      setSrc(fallbackUrl);
      setLoaded(false);
    } else {
      setError(true);
    }
  };

  if (!src || error) {
    return <FallbackCard name={name} muscle={muscle} size={size} />;
  }

  return (
    <div className={`w-full ${h} bg-gray-800 rounded-2xl overflow-hidden relative group`}>
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <FallbackCard name={name} muscle={muscle} size={size} />
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={`${name} exercise demo`}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100 z-20" : "opacity-0 z-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        loading="lazy"
      />
      {loaded && (
        <div className="absolute top-2 left-2 z-30 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
          {muscle}
        </div>
      )}
    </div>
  );
}
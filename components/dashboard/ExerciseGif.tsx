"use client";
import { useState } from "react";
import { muscleEmoji } from "@/lib/exercises";

interface Props {
  gifId: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

export default function ExerciseGif({ gifId, name, muscle, size = "md" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);

  const emoji = muscleEmoji[muscle.toLowerCase()] || "💪";
  const heightClass = size === "sm" ? "h-36" : size === "lg" ? "h-64" : "h-48";

  const sources = gifId ? [
    `https://v2.exercisedb.io/image/${gifId}.gif`,
    `https://exercisedb.io/image/${gifId}.gif`,
  ] : [];

  const handleError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setError(true);
    }
  };

  if (!gifId || error || sources.length === 0) {
    return (
      <div className={`w-full ${heightClass} bg-gray-800 rounded-2xl flex flex-col items-center justify-center`}>
        <span className="text-4xl mb-2">{emoji}</span>
        <p className="text-gray-400 text-xs text-center px-2">{name}</p>
        <p className="text-gray-600 text-xs mt-1">Demo coming soon</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} bg-gray-800 rounded-2xl overflow-hidden relative`}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-xs">Loading demo...</p>
        </div>
      )}
      <img
        src={sources[srcIndex]}
        alt={name}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}
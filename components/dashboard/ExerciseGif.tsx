"use client";
import { useState } from "react";
import { muscleEmoji } from "@/lib/exercises";

interface Props {
  gifId: string | null;
  name: string;
  muscle: string;
}

export default function ExerciseGif({ gifId, name, muscle }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const gifUrl = gifId ? `https://v2.exercisedb.io/image/${gifId}.gif` : null;
  const emoji = muscleEmoji[muscle.toLowerCase()] || "💪";

  if (!gifUrl || error) {
    return (
      <div className="w-full h-48 bg-gray-800 rounded-2xl flex flex-col items-center justify-center">
        <span className="text-5xl mb-2">{emoji}</span>
        <p className="text-gray-400 text-sm">{name}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-48 bg-gray-800 rounded-2xl overflow-hidden relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={gifUrl}
        alt={name}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
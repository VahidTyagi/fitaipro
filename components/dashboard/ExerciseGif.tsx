"use client";
import { useState } from "react";
import ExerciseAnimation from "./ExerciseAnimation";

interface Props {
  exerciseId?: string;
  gifUrl?: string | null;
  name: string;
  muscle: string;
  gender?: "male" | "female" | "other";
  size?: "sm" | "md" | "lg";
}

export default function ExerciseGif({ exerciseId, gifUrl, name, muscle, size = "md" }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const h = size === "sm" ? "h-36" : size === "lg" ? "h-64" : "h-52";

  // Try to load image from API proxy
  // If it fails or is slow → SVG animation shows (it's always there underneath)
  const imgSrc = exerciseId ? `/api/gif/${exerciseId}` : null;

  return (
    <div className={`w-full ${h} rounded-2xl overflow-hidden relative`}>
      {/* SVG Animation — always visible as primary */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${imgLoaded ? "opacity-0" : "opacity-100"}`}>
        <ExerciseAnimation
          exerciseId={exerciseId}
          name={name}
          muscle={muscle}
          size={size}
        />
      </div>

      {/* Real image — loads on top when available */}
      {imgSrc && !imgError && (
        <img
          src={imgSrc}
          alt={`${name} demonstration`}
          className={`absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-700 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* Muscle badge */}
      <div className="absolute top-2 left-2 z-30 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
        {muscle}
      </div>
    </div>
  );
}
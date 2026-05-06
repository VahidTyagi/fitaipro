"use client";
import { useState, useEffect, useCallback } from "react";
import { getExerciseFrames } from "@/lib/exercise-gifs";

interface Props {
  exerciseId?: string;
  gifUrl?: string | null;
  name: string;
  muscle: string;
  gender?: "male" | "female" | "other";
  size?: "sm" | "md" | "lg";
}

const MUSCLE_STYLE: Record<string, { gradient: string; emoji: string }> = {
  chest:       { gradient: "from-red-500 to-rose-700",      emoji: "💪" },
  back:        { gradient: "from-blue-500 to-indigo-700",   emoji: "🔙" },
  shoulders:   { gradient: "from-purple-500 to-violet-700", emoji: "🏋️" },
  biceps:      { gradient: "from-orange-500 to-amber-700",  emoji: "💪" },
  triceps:     { gradient: "from-yellow-500 to-orange-600", emoji: "💪" },
  quads:       { gradient: "from-green-500 to-emerald-700", emoji: "🦵" },
  legs:        { gradient: "from-green-500 to-teal-700",    emoji: "🦵" },
  glutes:      { gradient: "from-pink-500 to-rose-700",     emoji: "🍑" },
  hamstrings:  { gradient: "from-lime-500 to-green-700",    emoji: "🦵" },
  abs:         { gradient: "from-indigo-500 to-blue-700",   emoji: "⚡" },
  cardio:      { gradient: "from-rose-500 to-red-700",      emoji: "❤️" },
  "full body": { gradient: "from-emerald-500 to-teal-700",  emoji: "🔥" },
};

// ── Fallback animated card ────────────────────────────────────────────────────
function FallbackCard({ name, muscle, size }: { name: string; muscle: string; size: string }) {
  const [frame, setFrame] = useState(0);
  const style = MUSCLE_STYLE[muscle.toLowerCase()] ?? {
    gradient: "from-emerald-500 to-teal-700",
    emoji: "💪",
  };
  const h = size === "sm" ? "h-36" : size === "lg" ? "h-64" : "h-52";
  const scales = ["scale-100", "scale-110", "scale-125", "scale-110"];

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 4), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`w-full ${h} bg-gradient-to-br ${style.gradient} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden select-none`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-28 h-28 rounded-full bg-white/10 animate-ping"
          style={{ animationDuration: "2s" }}
        />
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

// ── Main ExerciseGif component ────────────────────────────────────────────────
export default function ExerciseGif({
  exerciseId,
  gifUrl,
  name,
  muscle,
  gender = "male",
  size = "md",
}: Props) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState<boolean[]>([false, false]);
  const [frameErrors, setFrameErrors] = useState<boolean[]>([false, false]);
  const h = size === "sm" ? "h-36" : size === "lg" ? "h-64" : "h-52";

  // Get frame URLs from GitHub CDN
  const frames = exerciseId
    ? getExerciseFrames(exerciseId, gender) ?? null
    : null;

  // Animate between frame 0 and frame 1 (simulates GIF)
  useEffect(() => {
    if (!frames) return;
    if (!framesLoaded[0] || !framesLoaded[1]) return;
    if (frameErrors[0] && frameErrors[1]) return;

    const interval = setInterval(() => {
      setCurrentFrame((f) => (f === 0 ? 1 : 0));
    }, 1200); // Switch every 1.2 seconds

    return () => clearInterval(interval);
  }, [framesLoaded, frameErrors, frames]);

  const handleLoad = useCallback(
    (index: number) => {
      setFramesLoaded((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    },
    []
  );

  const handleError = useCallback(
    (index: number) => {
      setFrameErrors((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    },
    []
  );

  // If no frames available, show fallback
  const allFailed = frames ? frameErrors[0] && frameErrors[1] : true;
  if (!frames || allFailed) {
    // If gifUrl exists (from exercises.ts), try that
    if (gifUrl && !gifUrl.includes("/gifs/")) {
      return <SingleGif gifUrl={gifUrl} name={name} muscle={muscle} size={size} h={h} />;
    }
    return <FallbackCard name={name} muscle={muscle} size={size} />;
  }

  const bothLoaded = framesLoaded[0] && framesLoaded[1];

  return (
    <div className={`w-full ${h} bg-gray-800 rounded-2xl overflow-hidden relative`}>
      {/* Show fallback while images load */}
      {!framesLoaded[0] && (
        <div className="absolute inset-0 z-10">
          <FallbackCard name={name} muscle={muscle} size={size} />
        </div>
      )}

      {/* Preload both frames */}
      {frames.map((url, i) => (
        <img
          key={`${url}-${i}`}
          src={url}
          alt={i === 0 ? `${name} start` : `${name} end`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            currentFrame === i && framesLoaded[i] && !frameErrors[i]
              ? "opacity-100 z-20"
              : "opacity-0 z-0"
          }`}
          onLoad={() => handleLoad(i)}
          onError={() => handleError(i)}
          loading="lazy"
        />
      ))}

      {/* Muscle badge */}
      {framesLoaded[0] && !frameErrors[0] && (
        <div className="absolute top-2 left-2 z-30 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
          {muscle}
        </div>
      )}

      {/* Gender badge */}
      {framesLoaded[0] && !frameErrors[0] && (
        <div className="absolute top-2 right-2 z-30 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {gender === "female" ? "👩" : "👨"}
        </div>
      )}

      {/* Animation progress dots */}
      {bothLoaded && !frameErrors[0] && !frameErrors[1] && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                currentFrame === i ? "bg-white scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single image fallback (for exercises not in free-exercise-db) ─────────────
function SingleGif({
  gifUrl, name, muscle, size, h,
}: {
  gifUrl: string; name: string; muscle: string; size: string; h: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return <FallbackCard name={name} muscle={muscle} size={size} />;

  return (
    <div className={`w-full ${h} bg-gray-800 rounded-2xl overflow-hidden relative`}>
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <FallbackCard name={name} muscle={muscle} size={size} />
        </div>
      )}
      <img
        src={gifUrl}
        alt={`${name} exercise`}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100 z-20" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      {loaded && (
        <div className="absolute top-2 left-2 z-30 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {muscle}
        </div>
      )}
    </div>
  );
}
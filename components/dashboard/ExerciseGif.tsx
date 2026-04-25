"use client";
import { useState, useEffect } from "react";

interface Props {
  gifUrl?: string | null;
  exerciseId?: string;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

// ── GitHub CDN mapping ───────────────────────────────────────────────────────
// Raw GitHub images — no auth, no hotlink block, works in browsers
const GITHUB_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const EXERCISE_FRAMES: Record<string, string> = {
  // Home — no equipment
  pushup:            "Push-Up",
  squat_bw:          "Bodyweight-Squat",
  plank:             "Plank",
  lunge_bw:          "Lunge",
  mountain_climber:  "Mountain-Climber",
  burpee:            "Burpee",
  glute_bridge:      "Glute-Bridge",
  jumping_jack:      "Jumping-Jacks",
  crunches:          "Crunch",
  high_knees:        "High-Knee-Run-in-Place",
  tricep_dip:        "Triceps-Dip",
  superman:          "Superman",
  leg_raise:         "Leg-Raise",
  pike_pushup:       "Pike-Push-Up",
  wall_sit:          "Wall-Sit",
  // Home — with equipment
  db_bench_press:    "Dumbbell-Bench-Press",
  db_row:            "Bent-Over-Dumbbell-Row",
  db_shoulder_press: "Dumbbell-Shoulder-Press",
  goblet_squat:      "Goblet-Squat",
  db_curl:           "Dumbbell-Bicep-Curl",
  db_rdl:            "Romanian-Deadlift",
  db_lateral_raise:  "Lateral-Raise",
  db_chest_fly:      "Dumbbell-Flyes",
  db_lunge:          "Dumbbell-Lunge",
  db_tricep_ext:     "Triceps-Extension",
  // Gym
  barbell_bench:     "Barbell-Bench-Press",
  deadlift:          "Barbell-Deadlift",
  squat_barbell:     "Barbell-Back-Squat",
  overhead_press:    "Barbell-Overhead-Press",
  lat_pulldown:      "Lat-Pulldown",
  cable_fly:         "Cable-Crossover",
  leg_press:         "Leg-Press",
  tricep_pushdown:   "Triceps-Pushdown",
  face_pull:         "Face-Pull",
  cable_row:         "Seated-Cable-Row",
  incline_db_press:  "Incline-Dumbbell-Press",
  leg_curl:          "Lying-Leg-Curl",
};

function getFrameUrls(exerciseId: string): [string, string] {
  const folder = EXERCISE_FRAMES[exerciseId];
  if (!folder) return ["", ""];
  return [
    `${GITHUB_BASE}/${folder}/images/0.jpg`,
    `${GITHUB_BASE}/${folder}/images/1.jpg`,
  ];
}

// ── Muscle styles ────────────────────────────────────────────────────────────
const MUSCLE_STYLE: Record
  string,
  { gradient: string; emoji: string }
> = {
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

// ── Animated fallback card ───────────────────────────────────────────────────
function FallbackCard({
  name,
  muscle,
  size,
}: {
  name: string;
  muscle: string;
  size: string;
}) {
  const [frame, setFrame] = useState(0);
  const style =
    MUSCLE_STYLE[muscle.toLowerCase()] || {
      gradient: "from-emerald-500 to-teal-700",
      emoji: "💪",
    };
  const h = { sm: "h-36", md: "h-52", lg: "h-64" }[size] || "h-52";
  const scales = ["scale-100", "scale-110", "scale-125", "scale-110"];

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 4), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`w-full ${h} bg-gradient-to-br ${style.gradient} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden select-none`}
    >
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-28 h-28 rounded-full bg-white/10 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <div className="absolute w-20 h-20 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Pulsing emoji */}
      <span
        className={`text-5xl mb-2 relative z-10 transition-transform duration-300 ${scales[frame]}`}
      >
        {style.emoji}
      </span>

      <p className="text-white font-bold text-sm relative z-10 px-3 text-center">
        {name}
      </p>
      <p className="text-white/70 text-xs relative z-10 mt-1">
        See instructions ↓
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ExerciseGif({
  gifUrl,
  exerciseId,
  name,
  muscle,
  size = "md",
}: Props) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const h = { sm: "h-36", md: "h-52", lg: "h-64" }[size] || "h-52";

  // Determine image URLs
  const githubUrls =
    exerciseId ? getFrameUrls(exerciseId) : (["", ""] as [string, string]);

  const [frame0, frame1] = githubUrls;
  const hasGithub = !!frame0;

  // Use gifUrl from exerciseDB as last resort fallback
  const imageUrls: string[] = hasGithub
    ? [frame0, frame1].filter(Boolean)
    : gifUrl
    ? [gifUrl]
    : [];

  const allFailed =
    imageUrls.length > 0 &&
    imageUrls.every((_, i) => failed[i]);

  // Animate between frame 0 and frame 1 every 1.2 seconds
  useEffect(() => {
    if (imageUrls.length <= 1) return;
    if (!loaded[0] || !loaded[1]) return; // wait until both loaded

    const t = setInterval(() => {
      setCurrentFrame((f) => (f + 1) % imageUrls.length);
    }, 1200);
    return () => clearInterval(t);
  }, [imageUrls.length, loaded]);

  // Show fallback if no URLs or all failed
  if (imageUrls.length === 0 || allFailed) {
    return (
      <FallbackCard name={name} muscle={muscle} size={size} />
    );
  }

  return (
    <div
      className={`w-full ${h} bg-gray-800 rounded-2xl overflow-hidden relative`}
    >
      {/* Show fallback while loading */}
      {!loaded[0] && (
        <div className="absolute inset-0 z-10">
          <FallbackCard name={name} muscle={muscle} size={size} />
        </div>
      )}

      {/* Preload both frames, display current */}
      {imageUrls.map((url, i) => (
        <img
          key={url}
          src={url}
          alt={i === 0 ? `${name} — start` : `${name} — end`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            i === currentFrame && loaded[i]
              ? "opacity-100 z-20"
              : "opacity-0 z-0"
          }`}
          onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
          onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
          loading="lazy"
        />
      ))}

      {/* Muscle label */}
      {loaded[0] && (
        <div className="absolute top-2 left-2 z-30 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
          {muscle}
        </div>
      )}

      {/* Frame dots */}
      {imageUrls.length > 1 && loaded[0] && loaded[1] && (
        <div className="absolute bottom-2 right-2 z-30 flex gap-1">
          {imageUrls.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentFrame ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
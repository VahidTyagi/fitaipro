"use client";
import { useState, useEffect } from "react";

interface Props {
  gifUrl: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
  exerciseId?: string;
}

// CSS-based animated exercise cards (guaranteed to always work, no CDN dependency)
const EXERCISE_ANIMATIONS: Record<string, { emoji: string; color: string; moves: string }> = {
  pushup:          { emoji: "💪", color: "from-red-500 to-rose-600",      moves: "Push-down & up motion" },
  squat_bw:        { emoji: "🦵", color: "from-green-500 to-emerald-600", moves: "Squat down & up" },
  plank:           { emoji: "⚡", color: "from-indigo-500 to-blue-600",   moves: "Static hold position" },
  lunge_bw:        { emoji: "🏃", color: "from-teal-500 to-cyan-600",     moves: "Step forward & back" },
  mountain_climber:{ emoji: "🔥", color: "from-orange-500 to-red-600",    moves: "Alternating knee drives" },
  burpee:          { emoji: "💥", color: "from-purple-500 to-violet-600", moves: "Drop, push-up, jump up" },
  glute_bridge:    { emoji: "🍑", color: "from-pink-500 to-rose-600",     moves: "Hips up & down" },
  jumping_jack:    { emoji: "❤️", color: "from-rose-500 to-red-600",      moves: "Jump & spread arms/legs" },
  crunches:        { emoji: "⚡", color: "from-blue-500 to-indigo-600",   moves: "Curl up & down" },
  high_knees:      { emoji: "🏃", color: "from-amber-500 to-orange-600",  moves: "Run in place, knees high" },
  tricep_dip:      { emoji: "💪", color: "from-yellow-500 to-orange-500", moves: "Dip down & push up" },
  superman:        { emoji: "🦸", color: "from-blue-600 to-sky-700",      moves: "Lift & hold then lower" },
  wall_sit:        { emoji: "🧱", color: "from-slate-500 to-gray-600",    moves: "Static wall squat hold" },
  leg_raise:       { emoji: "🦵", color: "from-emerald-500 to-teal-600",  moves: "Legs up & slowly down" },
  pike_pushup:     { emoji: "🔺", color: "from-violet-500 to-purple-600", moves: "Head to floor & back up" },
  db_bench_press:  { emoji: "🏋️", color: "from-red-500 to-rose-600",      moves: "Press up & lower down" },
  db_row:          { emoji: "🔙", color: "from-blue-500 to-indigo-600",   moves: "Pull to hip & extend" },
  db_shoulder_press:{ emoji: "🏋️", color: "from-purple-500 to-violet-600",moves: "Press overhead & lower" },
  goblet_squat:    { emoji: "🏆", color: "from-amber-500 to-yellow-600",  moves: "Squat deep with dumbbell" },
  db_curl:         { emoji: "💪", color: "from-orange-500 to-amber-600",  moves: "Curl up & slowly lower" },
  db_rdl:          { emoji: "🦵", color: "from-green-600 to-emerald-700", moves: "Hinge forward & drive back" },
  db_lateral_raise:{ emoji: "🏋️", color: "from-cyan-500 to-blue-600",    moves: "Raise arms to sides" },
  db_chest_fly:    { emoji: "🦅", color: "from-red-400 to-rose-500",      moves: "Open arms wide & hug back" },
  db_lunge:        { emoji: "🦵", color: "from-teal-500 to-green-600",    moves: "Lunge forward & back" },
  barbell_bench:   { emoji: "🏋️", color: "from-red-600 to-rose-700",      moves: "Press bar up & lower" },
  deadlift:        { emoji: "⚓", color: "from-gray-600 to-slate-700",    moves: "Lift bar off floor & lower" },
  squat_barbell:   { emoji: "🏆", color: "from-green-600 to-emerald-700", moves: "Squat with bar on back" },
  overhead_press:  { emoji: "☝️", color: "from-purple-600 to-violet-700", moves: "Press bar overhead" },
  lat_pulldown:    { emoji: "🔙", color: "from-blue-600 to-indigo-700",   moves: "Pull bar to chest" },
  cable_fly:       { emoji: "🦅", color: "from-rose-500 to-pink-600",     moves: "Bring cables together" },
  leg_press:       { emoji: "🦵", color: "from-green-500 to-teal-600",    moves: "Press platform & lower" },
  tricep_pushdown: { emoji: "💪", color: "from-yellow-600 to-orange-600", moves: "Push cable down & release" },
  face_pull:       { emoji: "😤", color: "from-cyan-500 to-teal-600",     moves: "Pull rope to face & release" },
  cable_row:       { emoji: "🚣", color: "from-blue-500 to-sky-600",      moves: "Row handle to chest" },
  incline_db_press:{ emoji: "📐", color: "from-red-500 to-orange-600",    moves: "Press up on incline" },
  leg_curl:        { emoji: "🦵", color: "from-teal-600 to-cyan-700",     moves: "Curl leg up & lower" },
};

const MUSCLE_FALLBACK: Record<string, { emoji: string; color: string }> = {
  chest: { emoji: "💪", color: "from-red-500 to-rose-600" },
  back: { emoji: "🔙", color: "from-blue-500 to-indigo-600" },
  shoulders: { emoji: "🏋️", color: "from-purple-500 to-violet-600" },
  biceps: { emoji: "💪", color: "from-orange-500 to-amber-600" },
  triceps: { emoji: "💪", color: "from-yellow-500 to-orange-500" },
  quads: { emoji: "🦵", color: "from-green-500 to-emerald-600" },
  legs: { emoji: "🦵", color: "from-green-500 to-emerald-600" },
  glutes: { emoji: "🍑", color: "from-pink-500 to-rose-600" },
  hamstrings: { emoji: "🦵", color: "from-teal-500 to-cyan-600" },
  abs: { emoji: "⚡", color: "from-indigo-500 to-blue-600" },
  cardio: { emoji: "❤️", color: "from-rose-500 to-red-600" },
  "full body": { emoji: "🔥", color: "from-emerald-500 to-teal-600" },
};

function AnimatedExerciseCard({
  name, muscle, exerciseId, size
}: { name: string; muscle: string; exerciseId?: string; size: string }) {
  const [frame, setFrame] = useState(0);
  const anim = exerciseId ? EXERCISE_ANIMATIONS[exerciseId] : null;
  const fallback = MUSCLE_FALLBACK[muscle.toLowerCase()] || { emoji: "💪", color: "from-emerald-500 to-teal-600" };
  const { emoji, color, moves } = anim || { ...fallback, moves: "Follow the instructions below" };

  const heights = { sm: "h-36", md: "h-52", lg: "h-64" };
  const h = heights[size as keyof typeof heights] || "h-52";

  // Simple animation - pulse the emoji
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);

  const scales = ["scale-100", "scale-110", "scale-125", "scale-110"];

  return (
    <div className={`w-full ${h} bg-gradient-to-br ${color} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-24 h-24 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute w-16 h-16 rounded-full bg-white/15 animate-pulse" />
      </div>

      {/* Animated emoji */}
      <span
        className={`text-5xl mb-2 relative z-10 transition-transform duration-300 ${scales[frame]}`}
      >
        {emoji}
      </span>

      <p className="text-white font-bold text-base relative z-10 px-3 text-center">{name}</p>
      <p className="text-white/80 text-xs relative z-10 mt-1 px-4 text-center">{moves}</p>
      <p className="text-white/60 text-xs relative z-10 mt-2">See steps below ↓</p>
    </div>
  );
}

export default function ExerciseGif({ gifUrl, name, muscle, size = "md", exerciseId }: Props) {
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [showGif, setShowGif] = useState(false);

  const heights = { sm: "h-36", md: "h-52", lg: "h-64" };
  const h = heights[size];

  // Try to load GIF after component mounts (browser can load CDN GIFs even if server can't)
  useEffect(() => {
    if (!gifUrl) return;
    setShowGif(true);
  }, [gifUrl]);

  // If no GIF URL or GIF failed to load → show animated card
  if (!gifUrl || !showGif || gifError) {
    return <AnimatedExerciseCard name={name} muscle={muscle} exerciseId={exerciseId} size={size} />;
  }

  return (
    <div className={`w-full ${h} rounded-2xl overflow-hidden relative bg-gray-800`}>
      {/* Always show animated card underneath */}
      {!gifLoaded && (
        <div className="absolute inset-0 z-10">
          <AnimatedExerciseCard name={name} muscle={muscle} exerciseId={exerciseId} size={size} />
        </div>
      )}

      {/* GIF on top — shows when loaded */}
      <img
        src={gifUrl}
        alt={`${name} exercise demonstration`}
        className={`w-full h-full object-cover transition-opacity duration-700 absolute inset-0 ${gifLoaded ? "opacity-100 z-20" : "opacity-0 z-0"}`}
        onLoad={() => setGifLoaded(true)}
        onError={() => setGifError(true)}
        loading="lazy"
        crossOrigin="anonymous"
      />

      {/* Muscle label */}
      {gifLoaded && (
        <div className="absolute top-2 left-2 z-30 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
          {muscle}
        </div>
      )}
    </div>
  );
}
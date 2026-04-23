
"use client";
import { useState, useEffect } from "react";

interface Props {
  gifUrl?: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
  exerciseId?: string;
}

// Each exercise has a unique animation style
const EXERCISE_DISPLAY: Record<string, {
  emoji: string;
  bg: string;
  accent: string;
  animation: string;
  description: string;
}> = {
  pushup:           { emoji:"💪", bg:"from-red-600 to-rose-800",      accent:"#f43f5e", animation:"bounce-pushup",    description:"Push down & push up" },
  squat_bw:         { emoji:"🦵", bg:"from-green-600 to-emerald-800", accent:"#10b981", animation:"bounce-squat",     description:"Sit down & stand up" },
  plank:            { emoji:"⚡", bg:"from-indigo-600 to-blue-800",   accent:"#6366f1", animation:"pulse-plank",      description:"Hold straight position" },
  lunge_bw:         { emoji:"🏃", bg:"from-teal-600 to-cyan-800",     accent:"#14b8a6", animation:"bounce-lunge",     description:"Step forward, lower knee" },
  mountain_climber: { emoji:"🔥", bg:"from-orange-600 to-red-800",    accent:"#f97316", animation:"run-climber",      description:"Drive knees fast" },
  burpee:           { emoji:"💥", bg:"from-purple-600 to-violet-800", accent:"#a855f7", animation:"bounce-burpee",    description:"Drop, push up, jump!" },
  glute_bridge:     { emoji:"🍑", bg:"from-pink-600 to-rose-800",     accent:"#ec4899", animation:"bounce-bridge",    description:"Hips up, squeeze, lower" },
  jumping_jack:     { emoji:"⭐", bg:"from-yellow-600 to-orange-800", accent:"#eab308", animation:"spin-jack",        description:"Jump & spread arms/legs" },
  crunches:         { emoji:"⚡", bg:"from-blue-600 to-indigo-800",   accent:"#3b82f6", animation:"bounce-crunch",    description:"Curl up, squeeze abs" },
  high_knees:       { emoji:"🏃", bg:"from-amber-600 to-yellow-800",  accent:"#f59e0b", animation:"run-knees",        description:"Run in place, knees high" },
  tricep_dip:       { emoji:"💪", bg:"from-slate-600 to-gray-800",    accent:"#64748b", animation:"bounce-dip",       description:"Dip down, push back up" },
  superman:         { emoji:"🦸", bg:"from-sky-600 to-blue-800",      accent:"#0ea5e9", animation:"fly-superman",     description:"Lift arms, chest & legs" },
  wall_sit:         { emoji:"🧱", bg:"from-zinc-600 to-neutral-800",  accent:"#71717a", animation:"pulse-wallsit",    description:"Hold 90° squat position" },
  leg_raise:        { emoji:"🦵", bg:"from-emerald-600 to-teal-800",  accent:"#059669", animation:"bounce-legraise",  description:"Raise legs up slowly" },
  pike_pushup:      { emoji:"🔺", bg:"from-violet-600 to-purple-800", accent:"#7c3aed", animation:"bounce-pike",      description:"Head to floor & back up" },
  db_bench_press:   { emoji:"🏋️", bg:"from-red-700 to-rose-900",      accent:"#dc2626", animation:"press-bench",      description:"Press up & lower slowly" },
  db_row:           { emoji:"🚣", bg:"from-blue-700 to-indigo-900",   accent:"#1d4ed8", animation:"pull-row",         description:"Pull to hip, control down" },
  db_shoulder_press:{ emoji:"☝️", bg:"from-purple-700 to-violet-900", accent:"#7e22ce", animation:"press-shoulder",   description:"Press overhead & lower" },
  goblet_squat:     { emoji:"🏆", bg:"from-amber-700 to-yellow-900",  accent:"#b45309", animation:"bounce-squat",     description:"Squat deep, chest up" },
  db_curl:          { emoji:"💪", bg:"from-orange-700 to-amber-900",  accent:"#c2410c", animation:"curl-bicep",       description:"Curl up, squeeze, lower" },
  db_rdl:           { emoji:"⚓", bg:"from-green-700 to-emerald-900", accent:"#15803d", animation:"hinge-rdl",        description:"Hinge forward, feel stretch" },
  db_lateral_raise: { emoji:"🦅", bg:"from-cyan-700 to-sky-900",      accent:"#0e7490", animation:"raise-lateral",    description:"Raise arms to sides" },
  db_chest_fly:     { emoji:"🦅", bg:"from-rose-700 to-pink-900",     accent:"#be123c", animation:"fly-chest",        description:"Open arms wide & bring together" },
  db_lunge:         { emoji:"🦵", bg:"from-teal-700 to-green-900",    accent:"#0f766e", animation:"bounce-lunge",     description:"Lunge with dumbbells" },
  barbell_bench:    { emoji:"🏋️", bg:"from-red-800 to-rose-950",      accent:"#991b1b", animation:"press-bench",      description:"Press bar up & lower to chest" },
  deadlift:         { emoji:"💀", bg:"from-gray-700 to-slate-900",    accent:"#374151", animation:"lift-dead",        description:"Lift from floor, lock out" },
  squat_barbell:    { emoji:"🏋️", bg:"from-green-800 to-emerald-950", accent:"#166534", animation:"bounce-squat",     description:"Bar on back, squat deep" },
  overhead_press:   { emoji:"🙌", bg:"from-purple-800 to-violet-950", accent:"#581c87", animation:"press-shoulder",   description:"Press bar overhead, lockout" },
  lat_pulldown:     { emoji:"🔙", bg:"from-blue-800 to-indigo-950",   accent:"#1e3a8a", animation:"pull-row",         description:"Pull bar to upper chest" },
  cable_fly:        { emoji:"🦅", bg:"from-rose-800 to-pink-950",     accent:"#9f1239", animation:"fly-chest",        description:"Bring cables together" },
  leg_press:        { emoji:"🦵", bg:"from-teal-800 to-cyan-950",     accent:"#134e4a", animation:"bounce-squat",     description:"Press platform, control down" },
  tricep_pushdown:  { emoji:"👇", bg:"from-yellow-700 to-orange-900", accent:"#a16207", animation:"press-down",       description:"Push cable down to lockout" },
  face_pull:        { emoji:"😤", bg:"from-cyan-800 to-sky-950",      accent:"#155e75", animation:"pull-face",        description:"Pull rope to face, elbows high" },
  cable_row:        { emoji:"🚣", bg:"from-sky-800 to-blue-950",      accent:"#1e40af", animation:"pull-row",         description:"Row handle to chest" },
  incline_db_press: { emoji:"📐", bg:"from-orange-800 to-red-950",    accent:"#9a3412", animation:"press-bench",      description:"Press at incline angle" },
  leg_curl:         { emoji:"🦵", bg:"from-emerald-800 to-teal-950",  accent:"#064e3b", animation:"curl-leg",         description:"Curl leg up to glutes" },
};

const SIZE_MAP = { sm: { h: "h-36", emoji: "text-4xl", font: "text-sm" }, md: { h: "h-52", emoji: "text-5xl", font: "text-base" }, lg: { h: "h-64", emoji: "text-6xl", font: "text-lg" } };

export default function ExerciseGif({ gifUrl, name, muscle, size = "md", exerciseId }: Props) {
  const [step, setStep] = useState(0);
  const data = exerciseId ? EXERCISE_DISPLAY[exerciseId] : null;
  const fallbackGradient = "from-emerald-600 to-teal-800";
  const { h, emoji: emojiSize, font } = SIZE_MAP[size];

  // Animate the emoji in 4 steps
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 4), 700);
    return () => clearInterval(id);
  }, []);

  const scaleClasses = ["scale-100 translate-y-0", "scale-110 -translate-y-2", "scale-125 -translate-y-3", "scale-110 -translate-y-1"];
  const bg = data?.bg || fallbackGradient;
  const displayEmoji = data?.emoji || "💪";
  const desc = data?.description || "Follow instructions below";

  return (
    <div className={`w-full ${h} bg-gradient-to-br ${bg} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden select-none`}>
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-40 h-40 rounded-full border border-white/10 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute w-28 h-28 rounded-full border border-white/15" />
        <div className="absolute w-16 h-16 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Animated emoji */}
      <span
        className={`${emojiSize} relative z-10 transition-all duration-500 ease-in-out ${scaleClasses[step]}`}
        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
      >
        {displayEmoji}
      </span>

      {/* Name */}
      <p className={`text-white font-bold ${font} relative z-10 mt-3 px-4 text-center leading-tight`}
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
        {name}
      </p>

      {/* Description */}
      <p className="text-white/75 text-xs relative z-10 mt-1 px-4 text-center">{desc}</p>

      {/* Muscle badge */}
      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
        <span className="text-white/90 text-xs font-medium">{muscle}</span>
      </div>

      {/* "See steps below" hint */}
      <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
        <span className="text-white/70 text-xs">Steps ↓</span>
      </div>
    </div>
  );
}
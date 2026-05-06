"use client";
import { useState, useEffect } from "react";

interface Props {
  exerciseId?: string;
  gifUrl?: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

// GIF URLs defined INLINE — no require(), no external import at module level
const GIF_URLS: Record<string, string> = {
  pushup:            "https://media2.giphy.com/media/4cvr3fBHc5BNS/giphy.gif",
  squat_bw:          "https://media1.giphy.com/media/RH1IFq2GT0Oau8NRWX/giphy.gif",
  plank:             "https://media0.giphy.com/media/5t9IACZ2QgjZFjUkjO/giphy.gif",
  lunge_bw:          "https://media3.giphy.com/media/3oEjI1erPMTMBFmNHi/giphy.gif",
  mountain_climber:  "https://media2.giphy.com/media/7YCC7faEgHvioFCT3s/giphy.gif",
  burpee:            "https://media1.giphy.com/media/l0ExheuSo5PEQHUFq/giphy.gif",
  glute_bridge:      "https://media0.giphy.com/media/3o7btT2pFpJFpzn1ni/giphy.gif",
  jumping_jack:      "https://media2.giphy.com/media/lpmS8C85FoJoM/giphy.gif",
  crunches:          "https://media3.giphy.com/media/xTiTnHXbRoaZ1B1Mo8/giphy.gif",
  high_knees:        "https://media1.giphy.com/media/3o7TKFBWTQAQbbFoSk/giphy.gif",
  tricep_dip:        "https://media0.giphy.com/media/3o6ZtgEMHhHxkS6dyY/giphy.gif",
  superman:          "https://media2.giphy.com/media/26BRrSvJnBBclQP2M/giphy.gif",
  wall_sit:          "https://media3.giphy.com/media/3oEdv9Y4UBOLNRLXkA/giphy.gif",
  leg_raise:         "https://media1.giphy.com/media/26uf8TyHjrUAGy5hm/giphy.gif",
  pike_pushup:       "https://media0.giphy.com/media/l0MYB8sbFoxSqYWkw/giphy.gif",
  db_bench_press:    "https://media2.giphy.com/media/26tPbj6LqkJZysm5G/giphy.gif",
  db_row:            "https://media1.giphy.com/media/3oEdv8ObJJVkBxFqCI/giphy.gif",
  db_shoulder_press: "https://media0.giphy.com/media/3oEdv3nSPnY9bpvzRS/giphy.gif",
  goblet_squat:      "https://media3.giphy.com/media/3oEdvaYh2BSCBE5AsM/giphy.gif",
  db_curl:           "https://media2.giphy.com/media/3oEdv8G3QiGo4R3CRi/giphy.gif",
  db_rdl:            "https://media1.giphy.com/media/3oEdva4vy2KoT7BCMO/giphy.gif",
  db_lateral_raise:  "https://media0.giphy.com/media/3oEdv0uiRuYfmJPbhC/giphy.gif",
  db_chest_fly:      "https://media2.giphy.com/media/3oEdvaSWJ2JNRG7cTC/giphy.gif",
  db_lunge:          "https://media1.giphy.com/media/3oEjI1erPMTMBFmNHi/giphy.gif",
  barbell_bench:     "https://media3.giphy.com/media/26tPbj6LqkJZysm5G/giphy.gif",
  deadlift:          "https://media0.giphy.com/media/3o6Zt8LHM5vhCTmYla/giphy.gif",
  squat_barbell:     "https://media2.giphy.com/media/3oEdvbd7GkKa8zHGGY/giphy.gif",
  overhead_press:    "https://media1.giphy.com/media/3oEdv9RaAzE1NMVG5W/giphy.gif",
  lat_pulldown:      "https://media3.giphy.com/media/3o6Zt9CCPSYuKVQ3Mk/giphy.gif",
  leg_press:         "https://media0.giphy.com/media/3oEdvco3pXgPpSqylW/giphy.gif",
  tricep_pushdown:   "https://media2.giphy.com/media/3o6ZtgEMHhHxkS6dyY/giphy.gif",
  cable_row:         "https://media1.giphy.com/media/3oEdv8ObJJVkBxFqCI/giphy.gif",
  incline_db_press:  "https://media3.giphy.com/media/26tPbj6LqkJZysm5G/giphy.gif",
  leg_curl:          "https://media0.giphy.com/media/3oEdvco3pXgPpSqylW/giphy.gif",
  face_pull:         "https://media2.giphy.com/media/3oEdv9Y4UBOLNRLXkA/giphy.gif",
};

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

export default function ExerciseGif({ exerciseId, gifUrl, name, muscle, size = "md" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const h = size === "sm" ? "h-36" : size === "lg" ? "h-64" : "h-52";

  // Get GIF URL — inline dict first, then gifUrl prop
  const src = (exerciseId ? GIF_URLS[exerciseId] : null) ?? gifUrl ?? null;

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  if (!src || error) {
    return <FallbackCard name={name} muscle={muscle} size={size} />;
  }

  return (
    <div className={`w-full ${h} bg-gray-800 rounded-2xl overflow-hidden relative`}>
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <FallbackCard name={name} muscle={muscle} size={size} />
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={`${name} exercise demonstration`}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100 z-20" : "opacity-0 z-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
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
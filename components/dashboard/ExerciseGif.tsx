"use client";
import { useState, useEffect } from "react";

interface Props {
  gifId: string | null;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

// Map exercise IDs to GitHub-hosted reliable images
const EXERCISE_IMAGES: Record<string, string[]> = {
  pushup: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up/images/1.jpg",
  ],
  squat_bw: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight-Squat/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight-Squat/images/1.jpg",
  ],
  plank: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/images/1.jpg",
  ],
  lunge_bw: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge/images/1.jpg",
  ],
  mountain_climber: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain-Climber/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain-Climber/images/1.jpg",
  ],
  burpee: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/images/1.jpg",
  ],
  glute_bridge: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute-Bridge/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute-Bridge/images/1.jpg",
  ],
  jumping_jack: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jumping-Jacks/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jumping-Jacks/images/1.jpg",
  ],
  db_bench_press: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell-Bench-Press/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell-Bench-Press/images/1.jpg",
  ],
  db_row: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Over-Dumbbell-Row/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Over-Dumbbell-Row/images/1.jpg",
  ],
  goblet_squat: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet-Squat/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet-Squat/images/1.jpg",
  ],
  db_curl: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell-Bicep-Curl/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell-Bicep-Curl/images/1.jpg",
  ],
  barbell_bench: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Bench-Press/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Bench-Press/images/1.jpg",
  ],
  deadlift: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Deadlift/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Deadlift/images/1.jpg",
  ],
  squat_barbell: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Back-Squat/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Back-Squat/images/1.jpg",
  ],
  overhead_press: [
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Overhead-Press/images/0.jpg",
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell-Overhead-Press/images/1.jpg",
  ],
};

const MUSCLE_COLORS: Record<string, string> = {
  chest: "from-red-500 to-pink-500",
  back: "from-blue-500 to-cyan-500",
  shoulders: "from-purple-500 to-violet-500",
  biceps: "from-orange-500 to-amber-500",
  triceps: "from-yellow-500 to-orange-500",
  legs: "from-green-500 to-emerald-500",
  glutes: "from-teal-500 to-cyan-500",
  abs: "from-indigo-500 to-blue-500",
  cardio: "from-rose-500 to-red-500",
  "full body": "from-emerald-500 to-teal-500",
};

const MUSCLE_EMOJI: Record<string, string> = {
  chest: "💪", back: "🔙", shoulders: "🏋️", biceps: "💪",
  triceps: "💪", legs: "🦵", glutes: "🏃", abs: "⚡",
  cardio: "❤️", "full body": "🔥",
};

export default function ExerciseGif({ gifId, name, muscle, size = "md" }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const heightClass = size === "sm" ? "h-32" : size === "lg" ? "h-64" : "h-48";
  const muscleKey = muscle.toLowerCase();
  const gradient = MUSCLE_COLORS[muscleKey] || "from-emerald-500 to-teal-500";
  const emoji = MUSCLE_EMOJI[muscleKey] || "💪";

  // Get images — try exercise ID first, then gifId as fallback CDN
  const images = gifId && EXERCISE_IMAGES[gifId]
    ? EXERCISE_IMAGES[gifId]
    : gifId
    ? [`https://v2.exercisedb.io/image/${gifId}.gif`]
    : [];

  // Animate between images (simulate GIF)
  useEffect(() => {
    if (images.length <= 1 || error) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [images.length, error]);

  const handleError = () => setError(true);
  const handleLoad = () => setLoaded(true);

  // Fallback — beautiful animated CSS card
  if (images.length === 0 || error) {
    return (
      <div className={`w-full ${heightClass} bg-gradient-to-br ${gradient} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden`}>
        {/* Animated background rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10 animate-ping absolute" />
          <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse absolute" />
        </div>
        <span className="text-4xl mb-2 relative z-10">{emoji}</span>
        <p className="text-white font-bold text-sm relative z-10 px-2 text-center">{name}</p>
        <p className="text-white/70 text-xs relative z-10 mt-1">Follow instructions below</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} bg-gray-800 rounded-2xl overflow-hidden relative`}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-800">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-xs">Loading demo...</p>
        </div>
      )}
      <img
        src={images[imgIndex]}
        alt={name}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {loaded && images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          Demo
        </div>
      )}
    </div>
  );
}
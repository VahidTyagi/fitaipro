"use client";

// Muscle group colors
const MUSCLE_GRADIENTS: Record<string, { from: string; to: string; accent: string }> = {
  chest:       { from: "#ef4444", to: "#be123c", accent: "#fca5a5" },
  back:        { from: "#3b82f6", to: "#1d4ed8", accent: "#93c5fd" },
  shoulders:   { from: "#8b5cf6", to: "#6d28d9", accent: "#c4b5fd" },
  biceps:      { from: "#f97316", to: "#c2410c", accent: "#fdba74" },
  triceps:     { from: "#eab308", to: "#a16207", accent: "#fde047" },
  quads:       { from: "#22c55e", to: "#15803d", accent: "#86efac" },
  legs:        { from: "#10b981", to: "#065f46", accent: "#6ee7b7" },
  glutes:      { from: "#ec4899", to: "#9d174d", accent: "#f9a8d4" },
  hamstrings:  { from: "#84cc16", to: "#3f6212", accent: "#bef264" },
  abs:         { from: "#6366f1", to: "#3730a3", accent: "#a5b4fc" },
  cardio:      { from: "#f43f5e", to: "#9f1239", accent: "#fda4af" },
  "full body": { from: "#14b8a6", to: "#0f766e", accent: "#5eead4" },
};

// Exercise-specific SVG animations
const EXERCISE_ANIMATIONS: Record<string, React.FC<{ color: string; accent: string }>> = {
  pushup: ({ color, accent }) => (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#bg)" rx="12" />
      {/* Floor */}
      <line x1="20" y1="130" x2="180" y2="130" stroke={accent} strokeWidth="3" strokeOpacity="0.5" />
      {/* Body — push up position animating */}
      <g>
        {/* Torso */}
        <line x1="60" y1="110" x2="130" y2="100" stroke={accent} strokeWidth="8" strokeLinecap="round">
          <animate attributeName="x1" values="60;60;60" dur="2s" repeatCount="indefinite" />
        </line>
        {/* Arms down */}
        <line x1="60" y1="110" x2="55" y2="128" stroke={accent} strokeWidth="6" strokeLinecap="round">
          <animate attributeName="y2" values="128;115;128" dur="2s" repeatCount="indefinite" />
          <animate attributeName="x1" values="60;60;60" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="100" y1="104" x2="95" y2="122" stroke={accent} strokeWidth="6" strokeLinecap="round">
          <animate attributeName="y2" values="122;109;122" dur="2s" repeatCount="indefinite" />
        </line>
        {/* Legs */}
        <line x1="130" y1="100" x2="160" y2="128" stroke={accent} strokeWidth="8" strokeLinecap="round" />
        {/* Head */}
        <circle cx="45" cy="103" r="10" fill={accent} fillOpacity="0.8">
          <animate attributeName="cy" values="103;90;103" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* Arrow indicating movement */}
      <text x="100" y="152" textAnchor="middle" fill={accent} fontSize="11" fontWeight="bold">PUSH UPS</text>
    </svg>
  ),

  squat_bw: ({ color, accent }) => (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={color} fillOpacity="0.2" rx="12" />
      <line x1="20" y1="135" x2="180" y2="135" stroke={accent} strokeWidth="3" strokeOpacity="0.5" />
      {/* Standing figure squatting */}
      <g>
        {/* Head */}
        <circle cx="100" cy="30" r="12" fill={accent} fillOpacity="0.8">
          <animate attributeName="cy" values="30;55;30" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Torso */}
        <line x1="100" y1="42" x2="100" y2="90" stroke={accent} strokeWidth="8" strokeLinecap="round">
          <animate attributeName="y1" values="42;67;42" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="90;100;90" dur="2s" repeatCount="indefinite" />
        </line>
        {/* Arms */}
        <line x1="100" y1="55" x2="70" y2="75" stroke={accent} strokeWidth="5" strokeLinecap="round">
          <animate attributeName="y1" values="55;75;55" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="75;90;75" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="100" y1="55" x2="130" y2="75" stroke={accent} strokeWidth="5" strokeLinecap="round">
          <animate attributeName="y1" values="55;75;55" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="75;90;75" dur="2s" repeatCount="indefinite" />
        </line>
        {/* Legs */}
        <line x1="100" y1="90" x2="80" y2="120" stroke={accent} strokeWidth="7" strokeLinecap="round">
          <animate attributeName="y1" values="90;100;90" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="120;130;120" dur="2s" repeatCount="indefinite" />
          <animate attributeName="x2" values="80;65;80" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="100" y1="90" x2="120" y2="120" stroke={accent} strokeWidth="7" strokeLinecap="round">
          <animate attributeName="y1" values="90;100;90" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="120;130;120" dur="2s" repeatCount="indefinite" />
          <animate attributeName="x2" values="120;135;120" dur="2s" repeatCount="indefinite" />
        </line>
      </g>
      <text x="100" y="155" textAnchor="middle" fill={accent} fontSize="11" fontWeight="bold">SQUATS</text>
    </svg>
  ),

  burpee: ({ color, accent }) => (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={color} fillOpacity="0.2" rx="12" />
      <line x1="20" y1="135" x2="180" y2="135" stroke={accent} strokeWidth="3" strokeOpacity="0.5" />
      <g>
        {/* Head */}
        <circle cx="100" cy="25" r="11" fill={accent} fillOpacity="0.85">
          <animate attributeName="cy" values="25;115;25;25" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
          <animate attributeName="cx" values="100;100;100;100" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Body */}
        <rect x="88" y="37" width="24" height="45" rx="8" fill={accent} fillOpacity="0.7">
          <animate attributeName="y" values="37;65;37;37" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
          <animate attributeName="height" values="45;20;45;45" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
        </rect>
        {/* Arms up */}
        <line x1="88" y1="50" x2="65" y2="30" stroke={accent} strokeWidth="5" strokeLinecap="round">
          <animate attributeName="y2" values="30;80;30;30" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
          <animate attributeName="x2" values="65;70;65;65" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
        </line>
        <line x1="112" y1="50" x2="135" y2="30" stroke={accent} strokeWidth="5" strokeLinecap="round">
          <animate attributeName="y2" values="30;80;30;30" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
          <animate attributeName="x2" values="135;130;135;135" dur="3s" repeatCount="indefinite" keyTimes="0;0.4;0.7;1" />
        </line>
      </g>
      <text x="100" y="155" textAnchor="middle" fill={accent} fontSize="11" fontWeight="bold">BURPEES</text>
    </svg>
  ),
};

// Generic animated figure that works for ANY exercise
function GenericExerciseAnimation({ name, muscle, color, accent }: {
  name: string; muscle: string; color: string; accent: string;
}) {
  const muscleMap: Record<string, string> = {
    abs: "CORE", chest: "CHEST", back: "BACK", shoulders: "SHOULDERS",
    biceps: "BICEPS", triceps: "TRICEPS", quads: "QUADS", legs: "LEGS",
    glutes: "GLUTES", hamstrings: "HAMSTRINGS", cardio: "CARDIO", "full body": "FULL BODY",
  };
  const label = muscleMap[muscle.toLowerCase()] || muscle.toUpperCase();

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${muscle}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill={`url(#grad-${muscle})`} rx="12" />

      {/* Animated stick figure */}
      {/* Head */}
      <circle cx="100" cy="35" r="14" fill={accent} fillOpacity="0.9">
        <animate attributeName="cy" values="35;32;35" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Torso */}
      <line x1="100" y1="49" x2="100" y2="95" stroke={accent} strokeWidth="8" strokeLinecap="round">
        <animate attributeName="y1" values="49;46;49" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="95;92;95" dur="1.5s" repeatCount="indefinite" />
      </line>

      {/* Left arm */}
      <line x1="100" y1="62" x2="72" y2="82" stroke={accent} strokeWidth="6" strokeLinecap="round">
        <animate attributeName="x2" values="72;65;72" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="82;75;82" dur="1.5s" repeatCount="indefinite" />
      </line>
      {/* Right arm */}
      <line x1="100" y1="62" x2="128" y2="82" stroke={accent} strokeWidth="6" strokeLinecap="round">
        <animate attributeName="x2" values="128;135;128" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="82;75;82" dur="1.5s" repeatCount="indefinite" />
      </line>

      {/* Left leg */}
      <line x1="100" y1="95" x2="80" y2="128" stroke={accent} strokeWidth="7" strokeLinecap="round">
        <animate attributeName="x2" values="80;75;80" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="128;125;128" dur="1.5s" repeatCount="indefinite" />
      </line>
      {/* Right leg */}
      <line x1="100" y1="95" x2="120" y2="128" stroke={accent} strokeWidth="7" strokeLinecap="round">
        <animate attributeName="x2" values="120;125;120" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="128;125;128" dur="1.5s" repeatCount="indefinite" />
      </line>

      {/* Floor */}
      <line x1="20" y1="135" x2="180" y2="135" stroke={accent} strokeWidth="2" strokeOpacity="0.4" />

      {/* Muscle highlight pulse */}
      <text x="100" y="153" textAnchor="middle" fill={accent} fontSize="10" fontWeight="bold" opacity="0.9">
        {name.toUpperCase().slice(0, 16)}
      </text>

      {/* Muscle target indicator */}
      <rect x="5" y="5" width="60" height="18" rx="9" fill={accent} fillOpacity="0.25" />
      <text x="35" y="18" textAnchor="middle" fill={accent} fontSize="9" fontWeight="bold">
        {label}
      </text>
    </svg>
  );
}

interface Props {
  exerciseId?: string;
  name: string;
  muscle: string;
  size?: "sm" | "md" | "lg";
}

export default function ExerciseAnimation({ exerciseId, name, muscle, size = "md" }: Props) {
  const h = size === "sm" ? "h-36" : size === "lg" ? "h-64" : "h-52";
  const muscleKey = muscle.toLowerCase();
  const style = MUSCLE_GRADIENTS[muscleKey] || MUSCLE_GRADIENTS.cardio;

  const SpecificAnimation = exerciseId ? EXERCISE_ANIMATIONS[exerciseId] : null;

  return (
    <div className={`w-full ${h} rounded-2xl overflow-hidden relative`}
      style={{ background: `linear-gradient(135deg, ${style.from}33, ${style.to}22)` }}>
      {SpecificAnimation ? (
        <SpecificAnimation color={style.from} accent={style.accent} />
      ) : (
        <GenericExerciseAnimation
          name={name}
          muscle={muscle}
          color={style.from}
          accent={style.accent}
        />
      )}
    </div>
  );
}
export interface Exercise {
    id: string;
    name: string;
    muscle: string;
    equipment: string;
    type: string; // home_no_equipment | home_with_equipment | gym
    gifId: string; // ExerciseDB gif ID
    instructions: string[];
    tips: string;
  }
  
  // GIF URL generator
  export function getGifUrl(gifId: string): string {
    return `https://v2.exercisedb.io/image/${gifId}.gif`;
  }
  
  // Fallback emoji per muscle group
  export const muscleEmoji: Record<string, string> = {
    chest: "💪",
    back: "🔙",
    shoulders: "🏋️",
    biceps: "💪",
    triceps: "💪",
    legs: "🦵",
    glutes: "🍑",
    abs: "🎯",
    cardio: "❤️",
    "full body": "⚡",
  };
  
  export const EXERCISE_LIBRARY: Exercise[] = [
    // ─── HOME NO EQUIPMENT ────────────────────────────────
    {
      id: "pushup",
      name: "Push Ups",
      muscle: "Chest",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0061",
      instructions: [
        "Start in a high plank position, hands slightly wider than shoulders",
        "Keep your body in a straight line from head to heels",
        "Lower your chest to just above the floor",
        "Push back up to starting position",
      ],
      tips: "Keep core tight. Don't let hips sag or rise.",
    },
    {
      id: "squat_bw",
      name: "Bodyweight Squats",
      muscle: "Legs",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0043",
      instructions: [
        "Stand feet shoulder-width apart, toes slightly out",
        "Push hips back and bend knees",
        "Lower until thighs are parallel to floor",
        "Drive through heels to return to start",
      ],
      tips: "Keep chest up and knees tracking over toes.",
    },
    {
      id: "plank",
      name: "Plank Hold",
      muscle: "Abs",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0048",
      instructions: [
        "Start in forearm plank position",
        "Keep body in straight line",
        "Engage core and glutes",
        "Hold for the required time",
      ],
      tips: "Breathe normally. Don't hold your breath.",
    },
    {
      id: "lunge_bw",
      name: "Reverse Lunges",
      muscle: "Legs",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0034",
      instructions: [
        "Stand tall with feet hip-width apart",
        "Step one foot backward and lower knee toward floor",
        "Front knee stays above ankle",
        "Push through front heel to return",
      ],
      tips: "Keep torso upright throughout the movement.",
    },
    {
      id: "mountain_climber",
      name: "Mountain Climbers",
      muscle: "Abs",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0029",
      instructions: [
        "Start in high plank position",
        "Drive one knee toward chest",
        "Quickly switch legs in running motion",
        "Keep hips level throughout",
      ],
      tips: "Speed up for cardio effect, slow down for core focus.",
    },
    {
      id: "burpee",
      name: "Burpees",
      muscle: "Full Body",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0013",
      instructions: [
        "Start standing, drop hands to floor",
        "Jump feet back to plank position",
        "Do a push up",
        "Jump feet forward, then jump up with arms overhead",
      ],
      tips: "Modify by stepping instead of jumping if needed.",
    },
    {
      id: "glute_bridge",
      name: "Glute Bridge",
      muscle: "Glutes",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0027",
      instructions: [
        "Lie on back, knees bent, feet flat on floor",
        "Push through heels to lift hips",
        "Squeeze glutes at the top",
        "Lower slowly back down",
      ],
      tips: "Hold at top for 2 seconds for max activation.",
    },
    {
      id: "jumping_jack",
      name: "Jumping Jacks",
      muscle: "Cardio",
      equipment: "bodyweight",
      type: "home_no_equipment",
      gifId: "0081",
      instructions: [
        "Stand with feet together, arms at sides",
        "Jump feet out while raising arms overhead",
        "Jump back to starting position",
        "Maintain steady rhythm",
      ],
      tips: "Land softly to protect your joints.",
    },
  
    // ─── HOME WITH EQUIPMENT ──────────────────────────────
    {
      id: "db_bench_press",
      name: "Dumbbell Bench Press",
      muscle: "Chest",
      equipment: "dumbbell",
      type: "home_with_equipment",
      gifId: "0176",
      instructions: [
        "Lie on bench or floor, dumbbells at chest level",
        "Press dumbbells straight up until arms extended",
        "Lower slowly back to chest level",
        "Keep shoulder blades retracted",
      ],
      tips: "Control the lowering phase for better results.",
    },
    {
      id: "db_row",
      name: "Dumbbell Rows",
      muscle: "Back",
      equipment: "dumbbell",
      type: "home_with_equipment",
      gifId: "0226",
      instructions: [
        "Hinge at hips, back flat, holding dumbbells",
        "Pull dumbbells toward your hips",
        "Squeeze shoulder blades together at top",
        "Lower with control",
      ],
      tips: "Lead with elbows, not hands.",
    },
    {
      id: "db_shoulder_press",
      name: "Dumbbell Shoulder Press",
      muscle: "Shoulders",
      equipment: "dumbbell",
      type: "home_with_equipment",
      gifId: "0096",
      instructions: [
        "Hold dumbbells at shoulder height",
        "Press straight overhead until arms extended",
        "Lower slowly back to start",
        "Keep core braced",
      ],
      tips: "Don't arch your lower back. Tighten your core.",
    },
    {
      id: "goblet_squat",
      name: "Goblet Squats",
      muscle: "Legs",
      equipment: "dumbbell",
      type: "home_with_equipment",
      gifId: "0200",
      instructions: [
        "Hold dumbbell vertically at chest height",
        "Squat deep keeping chest up",
        "Elbows track inside knees at bottom",
        "Drive through heels to stand",
      ],
      tips: "The weight helps you squat deeper with good form.",
    },
    {
      id: "db_curl",
      name: "Bicep Curls",
      muscle: "Biceps",
      equipment: "dumbbell",
      type: "home_with_equipment",
      gifId: "0299",
      instructions: [
        "Stand with dumbbells at sides, palms forward",
        "Curl dumbbells toward shoulders",
        "Squeeze biceps at top",
        "Lower slowly back to start",
      ],
      tips: "Keep elbows pinned to sides throughout.",
    },
    {
      id: "db_rdl",
      name: "Romanian Deadlifts",
      muscle: "Legs",
      equipment: "dumbbell",
      type: "home_with_equipment",
      gifId: "0059",
      instructions: [
        "Hold dumbbells in front of thighs",
        "Hinge at hips, pushing them backward",
        "Lower weights along legs until hamstring stretch",
        "Drive hips forward to return",
      ],
      tips: "Slight knee bend. Feel the stretch in hamstrings.",
    },
  
    // ─── GYM ──────────────────────────────────────────────
    {
      id: "barbell_bench",
      name: "Barbell Bench Press",
      muscle: "Chest",
      equipment: "barbell",
      type: "gym",
      gifId: "0025",
      instructions: [
        "Lie on bench, grip bar slightly wider than shoulders",
        "Unrack bar and lower to mid-chest",
        "Press bar up in slight arc",
        "Lock out elbows at top",
      ],
      tips: "Keep feet flat on floor and back arched naturally.",
    },
    {
      id: "deadlift",
      name: "Deadlift",
      muscle: "Back",
      equipment: "barbell",
      type: "gym",
      gifId: "0003",
      instructions: [
        "Stand with bar over mid-foot",
        "Hinge and grip bar, back flat",
        "Drive through floor, bar stays close to body",
        "Lock out hips and knees at top",
      ],
      tips: "Most important: keep your back flat. Never round.",
    },
    {
      id: "squat_barbell",
      name: "Barbell Back Squat",
      muscle: "Legs",
      equipment: "barbell",
      type: "gym",
      gifId: "0047",
      instructions: [
        "Bar rests on upper traps",
        "Feet shoulder-width, toes out",
        "Break at hips and knees simultaneously",
        "Drive hips up through the movement",
      ],
      tips: "Keep chest tall and brace core before each rep.",
    },
    {
      id: "overhead_press",
      name: "Overhead Press",
      muscle: "Shoulders",
      equipment: "barbell",
      type: "gym",
      gifId: "0033",
      instructions: [
        "Grip bar just outside shoulders",
        "Press bar overhead until arms locked out",
        "Bar travels in slight arc around your face",
        "Lower back to clavicle level",
      ],
      tips: "Squeeze glutes and abs throughout.",
    },
    {
      id: "lat_pulldown",
      name: "Lat Pulldown",
      muscle: "Back",
      equipment: "cable",
      type: "gym",
      gifId: "0236",
      instructions: [
        "Grip bar wider than shoulders",
        "Lean back slightly, pull bar to upper chest",
        "Squeeze lats at bottom",
        "Slowly return to full extension",
      ],
      tips: "Think about driving elbows down toward your hips.",
    },
    {
      id: "cable_fly",
      name: "Cable Flyes",
      muscle: "Chest",
      equipment: "cable",
      type: "gym",
      gifId: "0073",
      instructions: [
        "Set cables to shoulder height",
        "Step forward, arms wide with slight elbow bend",
        "Bring hands together in hugging motion",
        "Squeeze chest, then open arms slowly",
      ],
      tips: "Focus on the stretch — don't use too much weight.",
    },
    {
      id: "leg_press",
      name: "Leg Press",
      muscle: "Legs",
      equipment: "machine",
      type: "gym",
      gifId: "0056",
      instructions: [
        "Sit in machine, feet hip-width on platform",
        "Release safety, lower platform toward chest",
        "Press back up without locking knees",
        "Control the movement throughout",
      ],
      tips: "Don't let your lower back lift off the pad.",
    },
    {
      id: "tricep_pushdown",
      name: "Tricep Pushdowns",
      muscle: "Triceps",
      equipment: "cable",
      type: "gym",
      gifId: "0065",
      instructions: [
        "Stand at cable machine, bar at chest height",
        "Grip bar, elbows at sides",
        "Push bar down until arms fully extended",
        "Slowly return to start",
      ],
      tips: "Keep elbows locked to your sides throughout.",
    },
  ];
  
  // Get exercises by workout type
  export function getExercisesByType(type: string): Exercise[] {
    return EXERCISE_LIBRARY.filter((e) => e.type === type);
  }
  
  // Get exercise by ID
  export function getExerciseById(id: string): Exercise | undefined {
    return EXERCISE_LIBRARY.find((e) => e.id === id);
  }
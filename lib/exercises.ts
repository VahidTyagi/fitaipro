export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  muscleGroup: string; // for rotation logic
  equipment: string;
  type: string;
  gifUrl: string; // Direct working URL
  instructions: string[];
  tips: string;
}

// Working GIF URLs from ExerciseDB CDN
export const EXERCISE_LIBRARY: Exercise[] = [
  // HOME NO EQUIPMENT
  {
    id: "pushup",
    name: "Push Ups",
    muscle: "Chest",
    muscleGroup: "chest_triceps",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0061.gif",
    instructions: ["Start in plank, hands wider than shoulders", "Lower chest to floor", "Push back up fully", "Keep core tight throughout"],
    tips: "Don't let hips sag. Full range of motion.",
  },
  {
    id: "squat_bw",
    name: "Bodyweight Squats",
    muscle: "Quads",
    muscleGroup: "legs",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0043.gif",
    instructions: ["Feet shoulder-width, toes slightly out", "Push hips back, bend knees", "Lower until thighs parallel to floor", "Drive through heels to stand"],
    tips: "Knees track over toes. Keep chest up.",
  },
  {
    id: "plank",
    name: "Plank Hold",
    muscle: "Abs",
    muscleGroup: "core",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0048.gif",
    instructions: ["Forearm plank position", "Body straight head to heels", "Engage core and glutes", "Hold for required time"],
    tips: "Breathe normally. Don't hold your breath.",
  },
  {
    id: "lunge_bw",
    name: "Reverse Lunges",
    muscle: "Legs",
    muscleGroup: "legs",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0034.gif",
    instructions: ["Stand tall, hip-width stance", "Step one foot back, lower knee", "Front knee stays above ankle", "Push through front heel to return"],
    tips: "Keep torso upright. Control the descent.",
  },
  {
    id: "mountain_climber",
    name: "Mountain Climbers",
    muscle: "Abs",
    muscleGroup: "core",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0029.gif",
    instructions: ["High plank position", "Drive one knee to chest", "Switch legs quickly", "Keep hips level"],
    tips: "Faster = more cardio. Slower = more core.",
  },
  {
    id: "burpee",
    name: "Burpees",
    muscle: "Full Body",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0013.gif",
    instructions: ["Standing position", "Drop hands to floor, jump feet back", "Do a pushup", "Jump feet forward, jump up with arms overhead"],
    tips: "Step instead of jump to reduce impact.",
  },
  {
    id: "glute_bridge",
    name: "Glute Bridge",
    muscle: "Glutes",
    muscleGroup: "glutes_hamstrings",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0027.gif",
    instructions: ["Lie on back, knees bent", "Push through heels to lift hips", "Squeeze glutes at top", "Lower with control"],
    tips: "Hold 2 seconds at top for max activation.",
  },
  {
    id: "jumping_jack",
    name: "Jumping Jacks",
    muscle: "Cardio",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0081.gif",
    instructions: ["Feet together, arms at sides", "Jump feet out, raise arms overhead", "Jump back to start", "Steady rhythm"],
    tips: "Land softly to protect joints.",
  },
  {
    id: "crunches",
    name: "Crunches",
    muscle: "Abs",
    muscleGroup: "core",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0009.gif",
    instructions: ["Lie on back, knees bent", "Hands lightly behind head", "Curl upper body toward knees", "Lower with control"],
    tips: "Don't pull your neck. Use your abs.",
  },
  {
    id: "tricep_dip_chair",
    name: "Chair Tricep Dips",
    muscle: "Triceps",
    muscleGroup: "chest_triceps",
    equipment: "bodyweight",
    type: "home_no_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0066.gif",
    instructions: ["Sit on chair edge, hands beside hips", "Slide forward off edge", "Lower by bending elbows to 90°", "Push back up"],
    tips: "Keep back close to chair.",
  },
  // HOME WITH EQUIPMENT
  {
    id: "db_bench_press",
    name: "Dumbbell Bench Press",
    muscle: "Chest",
    muscleGroup: "chest_triceps",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0176.gif",
    instructions: ["Lie on bench/floor, dumbbells at chest", "Press up until arms extended", "Lower with control", "Keep shoulder blades retracted"],
    tips: "Slow on the way down for better gains.",
  },
  {
    id: "db_row",
    name: "Dumbbell Rows",
    muscle: "Back",
    muscleGroup: "back_biceps",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0226.gif",
    instructions: ["Hinge at hips, back flat", "Pull dumbbells to hips", "Squeeze shoulder blades", "Lower controlled"],
    tips: "Lead with elbows not hands.",
  },
  {
    id: "db_shoulder_press",
    name: "Dumbbell Shoulder Press",
    muscle: "Shoulders",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0096.gif",
    instructions: ["Dumbbells at shoulder height", "Press overhead", "Fully extend arms", "Lower slowly"],
    tips: "Don't arch lower back. Brace core.",
  },
  {
    id: "goblet_squat",
    name: "Goblet Squats",
    muscle: "Legs",
    muscleGroup: "legs",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0200.gif",
    instructions: ["Hold dumbbell at chest", "Squat deep keeping chest up", "Elbows inside knees at bottom", "Drive through heels"],
    tips: "Weight helps you squat deeper.",
  },
  {
    id: "db_curl",
    name: "Bicep Curls",
    muscle: "Biceps",
    muscleGroup: "back_biceps",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0299.gif",
    instructions: ["Arms at sides, palms forward", "Curl to shoulders", "Squeeze biceps at top", "Lower slowly"],
    tips: "Keep elbows pinned to sides.",
  },
  {
    id: "db_rdl",
    name: "Romanian Deadlifts",
    muscle: "Hamstrings",
    muscleGroup: "glutes_hamstrings",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0059.gif",
    instructions: ["Hold dumbbells at thighs", "Hinge at hips pushing them back", "Lower until hamstring stretch", "Drive hips forward to return"],
    tips: "Feel the hamstring stretch. Flat back always.",
  },
  {
    id: "db_lateral_raise",
    name: "Lateral Raises",
    muscle: "Shoulders",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    type: "home_with_equipment",
    gifUrl: "https://v2.exercisedb.io/image/0190.gif",
    instructions: ["Dumbbells at sides, slight elbow bend", "Raise arms out to sides", "Stop at shoulder height", "Lower with control"],
    tips: "Don't shrug. Lead with elbows.",
  },
  // GYM
  {
    id: "barbell_bench",
    name: "Barbell Bench Press",
    muscle: "Chest",
    muscleGroup: "chest_triceps",
    equipment: "barbell",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0025.gif",
    instructions: ["Grip bar slightly wider than shoulders", "Lower to mid-chest", "Press up in slight arc", "Lock out at top"],
    tips: "Keep feet flat, back naturally arched.",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscle: "Back",
    muscleGroup: "back_biceps",
    equipment: "barbell",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0003.gif",
    instructions: ["Bar over mid-foot", "Hinge, grip bar, back flat", "Drive through floor, bar close to body", "Lock hips and knees at top"],
    tips: "NEVER round your back. Most important rule.",
  },
  {
    id: "squat_barbell",
    name: "Barbell Back Squat",
    muscle: "Legs",
    muscleGroup: "legs",
    equipment: "barbell",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0047.gif",
    instructions: ["Bar on upper traps", "Feet shoulder-width, toes out", "Break at hips and knees together", "Drive hips up through movement"],
    tips: "Chest tall, brace before each rep.",
  },
  {
    id: "overhead_press",
    name: "Overhead Press",
    muscle: "Shoulders",
    muscleGroup: "shoulders",
    equipment: "barbell",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0033.gif",
    instructions: ["Grip just outside shoulders", "Press overhead to full lockout", "Bar travels around face", "Lower to clavicle level"],
    tips: "Squeeze glutes and abs throughout.",
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    muscle: "Back",
    muscleGroup: "back_biceps",
    equipment: "cable",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0236.gif",
    instructions: ["Grip wider than shoulders", "Lean back slightly", "Pull bar to upper chest", "Slowly return to full extension"],
    tips: "Drive elbows toward hips.",
  },
  {
    id: "cable_fly",
    name: "Cable Flyes",
    muscle: "Chest",
    muscleGroup: "chest_triceps",
    equipment: "cable",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0073.gif",
    instructions: ["Cables at shoulder height", "Arms wide, slight elbow bend", "Bring hands together in arc", "Open slowly to stretch"],
    tips: "Focus on the stretch. Not too much weight.",
  },
  {
    id: "leg_press",
    name: "Leg Press",
    muscle: "Legs",
    muscleGroup: "legs",
    equipment: "machine",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0056.gif",
    instructions: ["Feet hip-width on platform", "Release safety, lower platform", "Press back without locking knees", "Control movement throughout"],
    tips: "Don't let lower back lift off pad.",
  },
  {
    id: "tricep_pushdown",
    name: "Tricep Pushdowns",
    muscle: "Triceps",
    muscleGroup: "chest_triceps",
    equipment: "cable",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0065.gif",
    instructions: ["Cable at face height", "Elbows pinned to sides", "Push bar down to full extension", "Slowly return"],
    tips: "Keep elbows locked to sides.",
  },
  {
    id: "face_pull",
    name: "Face Pulls",
    muscle: "Shoulders",
    muscleGroup: "shoulders",
    equipment: "cable",
    type: "gym",
    gifUrl: "https://v2.exercisedb.io/image/0085.gif",
    instructions: ["Cable at face height", "Pull rope to face, elbows high", "Externally rotate at end", "Slowly return"],
    tips: "Great for shoulder health and posture.",
  },
];

export function getExercisesByType(type: string): Exercise[] {
  return EXERCISE_LIBRARY.filter((e) => e.type === type);
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

// Muscle groups that can repeat daily (like abs/cardio)
export const DAILY_REPEAT_GROUPS = ["core", "cardio"];

// Get muscle groups worked in last workout (for rotation)
export function getMuscleGroupsToAvoid(recentWorkoutData: any): string[] {
  if (!recentWorkoutData?.exercises) return [];
  const groups: string[] = [];
  for (const ex of recentWorkoutData.exercises) {
    const exercise = EXERCISE_LIBRARY.find((e) => e.id === ex.exerciseId);
    if (exercise && !DAILY_REPEAT_GROUPS.includes(exercise.muscleGroup)) {
      groups.push(exercise.muscleGroup);
    }
  }
  return [...new Set(groups)];
}

export const muscleEmoji: Record<string, string> = {
  chest: "💪", back: "🔙", shoulders: "🏋️", biceps: "💪",
  triceps: "💪", legs: "🦵", glutes: "🍑", abs: "⚡",
  cardio: "❤️", "full body": "🔥", hamstrings: "🦵",
};
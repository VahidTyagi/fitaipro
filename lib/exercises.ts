

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  muscleGroup: string;
  equipment: string;
  type: "home_no_equipment" | "home_with_equipment" | "gym";
  gifUrl: string;
  instructions: string[];
  tips: string;
  caloriesPerMin: number;
}

const BASE = "https://v2.exercisedb.io/image";

export const EXERCISE_LIBRARY: Exercise[] = [
  // HOME — NO EQUIPMENT
  { id: "pushup", name: "Push Ups", muscle: "Chest", muscleGroup: "chest_triceps", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0061.gif`, instructions: ["High plank, hands wider than shoulders", "Lower chest to floor", "Push back up fully", "Keep core tight"], tips: "Don't let hips sag.", caloriesPerMin: 7 },
  { id: "squat_bw", name: "Bodyweight Squats", muscle: "Quads", muscleGroup: "legs", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0043.gif`, instructions: ["Feet shoulder-width, toes out", "Push hips back, bend knees", "Lower until thighs parallel", "Drive through heels"], tips: "Knees track over toes.", caloriesPerMin: 8 },
  { id: "plank", name: "Plank Hold", muscle: "Abs", muscleGroup: "core", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0048.gif`, instructions: ["Forearm plank", "Body straight head to heels", "Engage core and glutes", "Hold required time"], tips: "Breathe normally.", caloriesPerMin: 4 },
  { id: "lunge_bw", name: "Reverse Lunges", muscle: "Legs", muscleGroup: "legs", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0034.gif`, instructions: ["Stand tall", "Step one foot back, lower knee", "Front knee above ankle", "Push through front heel"], tips: "Keep torso upright.", caloriesPerMin: 7 },
  { id: "mountain_climber", name: "Mountain Climbers", muscle: "Abs", muscleGroup: "core", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0029.gif`, instructions: ["High plank", "Drive one knee to chest", "Switch legs quickly", "Keep hips level"], tips: "Faster = cardio. Slower = core.", caloriesPerMin: 10 },
  { id: "burpee", name: "Burpees", muscle: "Full Body", muscleGroup: "cardio", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0013.gif`, instructions: ["Drop hands to floor", "Jump feet back", "Do a pushup", "Jump feet forward and up"], tips: "Step instead of jump to reduce impact.", caloriesPerMin: 12 },
  { id: "glute_bridge", name: "Glute Bridge", muscle: "Glutes", muscleGroup: "glutes_hamstrings", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0027.gif`, instructions: ["Lie on back, knees bent", "Push through heels", "Squeeze glutes at top", "Lower with control"], tips: "Hold 2 seconds at top.", caloriesPerMin: 5 },
  { id: "jumping_jack", name: "Jumping Jacks", muscle: "Cardio", muscleGroup: "cardio", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0081.gif`, instructions: ["Feet together, arms at sides", "Jump feet out, raise arms", "Jump back", "Steady rhythm"], tips: "Land softly.", caloriesPerMin: 9 },
  { id: "crunches", name: "Crunches", muscle: "Abs", muscleGroup: "core", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0009.gif`, instructions: ["Lie back, knees bent", "Hands behind head lightly", "Curl upper body up", "Lower with control"], tips: "Use abs not neck.", caloriesPerMin: 5 },
  { id: "high_knees", name: "High Knees", muscle: "Cardio", muscleGroup: "cardio", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0082.gif`, instructions: ["Stand feet hip-width", "Run in place", "Drive knees high", "Pump arms in rhythm"], tips: "Keep core tight.", caloriesPerMin: 11 },
  { id: "tricep_dip", name: "Chair Tricep Dips", muscle: "Triceps", muscleGroup: "chest_triceps", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0066.gif`, instructions: ["Sit on chair edge", "Slide forward", "Lower elbows to 90°", "Push back up"], tips: "Keep back close to chair.", caloriesPerMin: 6 },
  { id: "superman", name: "Superman Hold", muscle: "Back", muscleGroup: "back_biceps", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0045.gif`, instructions: ["Lie face down", "Arms extended overhead", "Lift arms, chest and legs", "Hold 2 seconds"], tips: "Squeeze glutes at top.", caloriesPerMin: 4 },
  { id: "wall_sit", name: "Wall Sit", muscle: "Quads", muscleGroup: "legs", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0050.gif`, instructions: ["Back flat against wall", "Slide down to 90°", "Knees above ankles", "Hold required time"], tips: "Push back into wall.", caloriesPerMin: 5 },
  { id: "leg_raise", name: "Leg Raises", muscle: "Abs", muscleGroup: "core", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0026.gif`, instructions: ["Lie flat on back", "Hands under glutes", "Raise legs to 90°", "Lower slowly"], tips: "Lower back stays on ground.", caloriesPerMin: 5 },
  { id: "pike_pushup", name: "Pike Push Ups", muscle: "Shoulders", muscleGroup: "shoulders", equipment: "bodyweight", type: "home_no_equipment", gifUrl: `${BASE}/0042.gif`, instructions: ["Downward dog position", "Hips high, head between arms", "Lower head toward floor", "Push back up"], tips: "Great shoulder builder.", caloriesPerMin: 7 },
  // HOME — WITH EQUIPMENT
  { id: "db_bench_press", name: "Dumbbell Bench Press", muscle: "Chest", muscleGroup: "chest_triceps", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0176.gif`, instructions: ["Lie on bench, dumbbells at chest", "Press up fully", "Lower with control", "Shoulder blades back"], tips: "Slow on the way down.", caloriesPerMin: 6 },
  { id: "db_row", name: "Dumbbell Rows", muscle: "Back", muscleGroup: "back_biceps", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0226.gif`, instructions: ["Hinge at hips, back flat", "Pull to hips", "Squeeze shoulder blades", "Lower controlled"], tips: "Lead with elbows.", caloriesPerMin: 6 },
  { id: "db_shoulder_press", name: "Shoulder Press", muscle: "Shoulders", muscleGroup: "shoulders", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0096.gif`, instructions: ["Dumbbells at shoulders", "Press overhead", "Fully extend", "Lower slowly"], tips: "Don't arch back.", caloriesPerMin: 6 },
  { id: "goblet_squat", name: "Goblet Squats", muscle: "Quads", muscleGroup: "legs", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0200.gif`, instructions: ["Hold dumbbell at chest", "Squat deep", "Elbows inside knees", "Drive through heels"], tips: "Weight helps depth.", caloriesPerMin: 8 },
  { id: "db_curl", name: "Bicep Curls", muscle: "Biceps", muscleGroup: "back_biceps", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0299.gif`, instructions: ["Arms at sides", "Curl to shoulders", "Squeeze biceps", "Lower slowly"], tips: "Keep elbows pinned.", caloriesPerMin: 5 },
  { id: "db_rdl", name: "Romanian Deadlifts", muscle: "Hamstrings", muscleGroup: "glutes_hamstrings", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0059.gif`, instructions: ["Dumbbells at thighs", "Hinge at hips", "Lower until stretch", "Drive hips forward"], tips: "Feel the hamstring stretch.", caloriesPerMin: 7 },
  { id: "db_lateral_raise", name: "Lateral Raises", muscle: "Shoulders", muscleGroup: "shoulders", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0190.gif`, instructions: ["Dumbbells at sides", "Raise to shoulder height", "Hold briefly", "Lower with control"], tips: "Don't shrug.", caloriesPerMin: 5 },
  { id: "db_chest_fly", name: "Dumbbell Chest Fly", muscle: "Chest", muscleGroup: "chest_triceps", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0180.gif`, instructions: ["Lie back, dumbbells above chest", "Open arms wide", "Feel chest stretch", "Bring back together"], tips: "Think hugging a tree.", caloriesPerMin: 5 },
  { id: "db_lunge", name: "Dumbbell Lunges", muscle: "Legs", muscleGroup: "legs", equipment: "dumbbell", type: "home_with_equipment", gifUrl: `${BASE}/0210.gif`, instructions: ["Hold dumbbells at sides", "Step forward", "Lower back knee", "Push through front heel"], tips: "Torso stays upright.", caloriesPerMin: 8 },
  // GYM
  { id: "barbell_bench", name: "Barbell Bench Press", muscle: "Chest", muscleGroup: "chest_triceps", equipment: "barbell", type: "gym", gifUrl: `${BASE}/0025.gif`, instructions: ["Grip wider than shoulders", "Lower to mid-chest", "Press up in arc", "Lock out at top"], tips: "Feet flat, natural arch.", caloriesPerMin: 7 },
  { id: "deadlift", name: "Deadlift", muscle: "Back", muscleGroup: "back_biceps", equipment: "barbell", type: "gym", gifUrl: `${BASE}/0003.gif`, instructions: ["Bar over mid-foot", "Flat back, grip bar", "Drive through floor", "Lock hips and knees"], tips: "NEVER round your back.", caloriesPerMin: 8 },
  { id: "squat_barbell", name: "Barbell Back Squat", muscle: "Quads", muscleGroup: "legs", equipment: "barbell", type: "gym", gifUrl: `${BASE}/0047.gif`, instructions: ["Bar on upper traps", "Feet shoulder-width", "Break at hips and knees", "Drive hips up"], tips: "Brace before each rep.", caloriesPerMin: 9 },
  { id: "overhead_press", name: "Overhead Press", muscle: "Shoulders", muscleGroup: "shoulders", equipment: "barbell", type: "gym", gifUrl: `${BASE}/0033.gif`, instructions: ["Grip outside shoulders", "Press overhead", "Full lockout", "Lower to clavicle"], tips: "Squeeze glutes and abs.", caloriesPerMin: 6 },
  { id: "lat_pulldown", name: "Lat Pulldown", muscle: "Back", muscleGroup: "back_biceps", equipment: "cable", type: "gym", gifUrl: `${BASE}/0236.gif`, instructions: ["Wide grip", "Lean back slightly", "Pull to upper chest", "Slowly extend"], tips: "Drive elbows to hips.", caloriesPerMin: 6 },
  { id: "cable_fly", name: "Cable Flyes", muscle: "Chest", muscleGroup: "chest_triceps", equipment: "cable", type: "gym", gifUrl: `${BASE}/0073.gif`, instructions: ["Cables at shoulder height", "Arms wide", "Bring together", "Open slowly"], tips: "Focus on stretch.", caloriesPerMin: 5 },
  { id: "leg_press", name: "Leg Press", muscle: "Quads", muscleGroup: "legs", equipment: "machine", type: "gym", gifUrl: `${BASE}/0056.gif`, instructions: ["Feet hip-width", "Lower platform", "Press back", "No locked knees"], tips: "Lower back stays down.", caloriesPerMin: 7 },
  { id: "tricep_pushdown", name: "Tricep Pushdowns", muscle: "Triceps", muscleGroup: "chest_triceps", equipment: "cable", type: "gym", gifUrl: `${BASE}/0065.gif`, instructions: ["Cable at face height", "Elbows at sides", "Push down fully", "Slowly return"], tips: "Keep elbows locked.", caloriesPerMin: 5 },
  { id: "face_pull", name: "Face Pulls", muscle: "Shoulders", muscleGroup: "shoulders", equipment: "cable", type: "gym", gifUrl: `${BASE}/0085.gif`, instructions: ["Cable at face height", "Pull rope to face", "Elbows high", "Slowly return"], tips: "Great for shoulder health.", caloriesPerMin: 5 },
  { id: "cable_row", name: "Seated Cable Row", muscle: "Back", muscleGroup: "back_biceps", equipment: "cable", type: "gym", gifUrl: `${BASE}/0238.gif`, instructions: ["Sit at cable", "Pull to chest", "Squeeze back", "Slowly extend"], tips: "Don't round back.", caloriesPerMin: 6 },
  { id: "incline_db_press", name: "Incline DB Press", muscle: "Chest", muscleGroup: "chest_triceps", equipment: "dumbbell", type: "gym", gifUrl: `${BASE}/0177.gif`, instructions: ["Bench at 30-45°", "Dumbbells at chest", "Press up", "Lower to stretch"], tips: "Targets upper chest.", caloriesPerMin: 6 },
  { id: "leg_curl", name: "Leg Curl Machine", muscle: "Hamstrings", muscleGroup: "glutes_hamstrings", equipment: "machine", type: "gym", gifUrl: `${BASE}/0057.gif`, instructions: ["Face down on machine", "Pad above heels", "Curl to glutes", "Lower slowly"], tips: "Don't arch back.", caloriesPerMin: 5 },
];

export function getExercisesByType(type: string): Exercise[] {
  return EXERCISE_LIBRARY.filter((e) => e.type === type);
}
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}
export const muscleEmoji: Record<string, string> = {
  chest: "💪", back: "🔙", shoulders: "🏋️", biceps: "💪",
  triceps: "💪", quads: "🦵", legs: "🦵", glutes: "🍑",
  hamstrings: "🦵", abs: "⚡", cardio: "❤️", "full body": "🔥",
};
export const DAILY_REPEAT_GROUPS = ["core", "cardio"];
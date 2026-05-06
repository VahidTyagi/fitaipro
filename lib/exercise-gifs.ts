// GitHub raw CDN — no hotlink blocking, 100% free, works in all browsers
// Source: github.com/yuhonas/free-exercise-db
// Each exercise has 2 frames: 0.jpg (start) and 1.jpg (end)
// We animate between them to create GIF effect

const GITHUB_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

// Maps our exercise ID → folder name in the free-exercise-db repo
// Format: [male_folder, female_folder] (same folder if no gender variant)
export const EXERCISE_FOLDERS: Record<string, [string, string]> = {
  // Home — No Equipment
  pushup:            ["Push-Up",                         "Push-Up"],
  squat_bw:          ["Bodyweight-Squat",                "Bodyweight-Squat"],
  plank:             ["Plank",                           "Plank"],
  lunge_bw:          ["Lunge",                           "Lunge"],
  mountain_climber:  ["Mountain-Climber",                "Mountain-Climber"],
  burpee:            ["Burpee",                          "Burpee"],
  glute_bridge:      ["Glute-Bridge",                    "Glute-Bridge"],
  jumping_jack:      ["Jumping-Jacks",                   "Jumping-Jacks"],
  crunches:          ["Crunch",                          "Crunch"],
  high_knees:        ["High-Knee-Run-in-Place",          "High-Knee-Run-in-Place"],
  tricep_dip:        ["Triceps-Dip",                     "Triceps-Dip"],
  superman:          ["Superman",                        "Superman"],
  wall_sit:          ["Wall-Sit",                        "Wall-Sit"],
  leg_raise:         ["Leg-Raise",                       "Leg-Raise"],
  pike_pushup:       ["Pike-Push-Up",                    "Pike-Push-Up"],
  // Home — With Equipment
  db_bench_press:    ["Dumbbell-Bench-Press",            "Dumbbell-Bench-Press"],
  db_row:            ["Bent-Over-Dumbbell-Row",          "Bent-Over-Dumbbell-Row"],
  db_shoulder_press: ["Dumbbell-Shoulder-Press",         "Dumbbell-Shoulder-Press"],
  goblet_squat:      ["Goblet-Squat",                    "Goblet-Squat"],
  db_curl:           ["Dumbbell-Bicep-Curl",             "Dumbbell-Bicep-Curl"],
  db_rdl:            ["Romanian-Deadlift",               "Romanian-Deadlift"],
  db_lateral_raise:  ["Lateral-Raise",                   "Lateral-Raise"],
  db_chest_fly:      ["Dumbbell-Flyes",                  "Dumbbell-Flyes"],
  db_lunge:          ["Dumbbell-Lunge",                  "Dumbbell-Lunge"],
  db_tricep_ext:     ["Triceps-Extension",               "Triceps-Extension"],
  // Gym
  barbell_bench:     ["Barbell-Bench-Press",             "Barbell-Bench-Press"],
  deadlift:          ["Barbell-Deadlift",                "Barbell-Deadlift"],
  squat_barbell:     ["Barbell-Back-Squat",              "Barbell-Back-Squat"],
  overhead_press:    ["Barbell-Overhead-Press",          "Barbell-Overhead-Press"],
  lat_pulldown:      ["Lat-Pulldown",                    "Lat-Pulldown"],
  cable_fly:         ["Cable-Crossover",                 "Cable-Crossover"],
  leg_press:         ["Leg-Press",                       "Leg-Press"],
  tricep_pushdown:   ["Triceps-Pushdown",                "Triceps-Pushdown"],
  face_pull:         ["Face-Pull",                       "Face-Pull"],
  cable_row:         ["Seated-Cable-Row",                "Seated-Cable-Row"],
  incline_db_press:  ["Incline-Dumbbell-Press",          "Incline-Dumbbell-Press"],
  leg_curl:          ["Lying-Leg-Curl",                  "Lying-Leg-Curl"],
};

export function getExerciseFrames(
  exerciseId: string,
  gender: "male" | "female" | "other" = "male"
): [string, string] | null {
  const folders = EXERCISE_FOLDERS[exerciseId];
  if (!folders) return null;
  const folder = gender === "female" ? folders[1] : folders[0];
  return [
    `${GITHUB_BASE}/${folder}/images/0.jpg`,
    `${GITHUB_BASE}/${folder}/images/1.jpg`,
  ];
}
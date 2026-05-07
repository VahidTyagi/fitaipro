import { NextRequest, NextResponse } from "next/server";

// Maps exercise ID → GitHub folder name
const EXERCISE_FOLDERS: Record<string, string> = {
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
  wall_sit:          "Wall-Sit",
  leg_raise:         "Leg-Raise",
  pike_pushup:       "Pike-Push-Up",
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

const GITHUB_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId: rawExerciseId } = await params;
  const exerciseId = rawExerciseId.replace(/\.(gif|jpg|png|webp)$/, "");
  const folder = EXERCISE_FOLDERS[exerciseId];

  if (!folder) {
    return new NextResponse("Exercise not found", { status: 404 });
  }

  // Try frame 0 first (start position)
  const imageUrl = `${GITHUB_BASE}/${folder}/images/0.jpg`;

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FitAIPro/1.0",
        "Accept": "image/*",
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 7 days — Vercel edge will cache this
        "Cache-Control": "public, max-age=604800, immutable",
        "X-Exercise-Id": exerciseId,
      },
    });
  } catch (error) {
    console.error(`Failed to fetch exercise image for ${exerciseId}:`, error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
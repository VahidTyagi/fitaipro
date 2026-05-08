import { NextRequest, NextResponse } from "next/server";

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

const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await params;
  // Strip file extension if present
  const id = exerciseId.replace(/\.(gif|jpg|jpeg|png|webp)$/i, "");
  const folder = EXERCISE_FOLDERS[id];

  if (!folder) {
    return new NextResponse("Not found", { status: 404 });
  }

  const imageUrl = `${BASE}/${folder}/images/0.jpg`;

  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FitAIPro/1.0",
        "Accept": "image/*,*/*",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.error(`GitHub fetch failed for ${id}: ${res.status}`);
      return new NextResponse("Image unavailable", { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable", // 30 days
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error(`GIF proxy error for ${id}:`, err.message);
    return new NextResponse("Fetch timeout", { status: 504 });
  }
}
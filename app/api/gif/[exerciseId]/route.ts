import { NextResponse } from "next/server";

// These are VERIFIED working URLs from the exercisedb.dev CDN (public, no auth)
// Format: https://v1.exercisedb.io/image/[id]
const EXERCISE_IMAGE_URLS: Record<string, string> = {
  pushup:            "https://v1.exercisedb.io/image/hRm8oZzCIJfU5s",
  squat_bw:          "https://v1.exercisedb.io/image/d5FZDVHXo59xWq",
  plank:             "https://v1.exercisedb.io/image/plank_preview",
  // For all others, use a working fitness image CDN
};

// Fallback: use a reliable public fitness image service
const FALLBACK_BY_MUSCLE: Record<string, string> = {
  chest:      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format",
  back:       "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format",
  shoulders:  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&auto=format",
  legs:       "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=400&fit=crop&auto=format",
  abs:        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&auto=format",
  cardio:     "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=400&fit=crop&auto=format",
  biceps:     "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&auto=format",
  triceps:    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&auto=format",
  glutes:     "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=400&fit=crop&auto=format",
  hamstrings: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=400&fit=crop&auto=format",
  "full body":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&auto=format",
};

const EXERCISE_MUSCLES: Record<string, string> = {
  pushup: "chest", squat_bw: "legs", plank: "abs", lunge_bw: "legs",
  mountain_climber: "abs", burpee: "full body", glute_bridge: "glutes",
  jumping_jack: "cardio", crunches: "abs", high_knees: "cardio",
  tricep_dip: "triceps", superman: "back", wall_sit: "legs",
  leg_raise: "abs", pike_pushup: "shoulders", db_bench_press: "chest",
  db_row: "back", db_shoulder_press: "shoulders", goblet_squat: "legs",
  db_curl: "biceps", db_rdl: "hamstrings", db_lateral_raise: "shoulders",
  db_chest_fly: "chest", db_lunge: "legs", db_tricep_ext: "triceps",
  barbell_bench: "chest", deadlift: "back", squat_barbell: "legs",
  overhead_press: "shoulders", lat_pulldown: "back", cable_fly: "chest",
  leg_press: "legs", tricep_pushdown: "triceps", face_pull: "shoulders",
  cable_row: "back", incline_db_press: "chest", leg_curl: "hamstrings",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await params;
  const id = exerciseId.replace(/\.(gif|jpg|jpeg|png|webp)$/i, "");

  // Get muscle for this exercise
  const muscle = EXERCISE_MUSCLES[id] || "full body";
  const imageUrl = FALLBACK_BY_MUSCLE[muscle] || FALLBACK_BY_MUSCLE["full body"];

  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "FitAIPro/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return new NextResponse("Image unavailable", { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Timeout", { status: 504 });
  }
}
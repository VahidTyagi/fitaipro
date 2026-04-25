import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // ← AUTH CHECK MUST BE FIRST LINE
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalWorkouts, todayWorkout, totalMeals] = await Promise.all([
      prisma.workout.count({
        where: { userId: dbUser.id, completedAt: { not: null } },
      }),
      prisma.workout.findFirst({
        where: { userId: dbUser.id, completedAt: { gte: today } },
      }),
      prisma.meal.count({ where: { userId: dbUser.id } }),
    ]);

    return NextResponse.json({
      totalWorkouts,
      workoutToday: !!todayWorkout,
      totalMeals,
      currentWeight: dbUser.currentWeight,
      targetWeight: dbUser.targetWeight,
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
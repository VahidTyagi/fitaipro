import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalWorkouts, todayWorkout, totalMeals, dailyCalories] =
      await Promise.all([
        prisma.workout.count({
          where: { userId: dbUser.id, completedAt: { not: null } },
        }),
        prisma.workout.findFirst({
          where: { userId: dbUser.id, completedAt: { gte: today } },
        }),
        prisma.meal.count({ where: { userId: dbUser.id } }),
        prisma.dailyCalories
          .findUnique({
            where: {
              userId_date: {
                userId: dbUser.id,
                date: today.toISOString().split("T")[0],
              },
            },
          })
          .catch(() => null),
      ]);

    return NextResponse.json({
      totalWorkouts,
      workoutToday: !!todayWorkout,
      totalMeals,
      currentWeight: dbUser.currentWeight ?? 0,
      targetWeight: dbUser.targetWeight ?? 0,
      // Calorie fields — always return numbers, never undefined
      totalCalories: dailyCalories?.caloriesBurned ?? 0,
      caloriesEaten: dailyCalories?.caloriesEaten ?? 0,
      netCalories: dailyCalories?.netCalories ?? 0,
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
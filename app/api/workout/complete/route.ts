import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workoutId } = await req.json();

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const workout = await prisma.workout.update({
      where: { id: workoutId, userId: dbUser.id },
      data: { completedAt: new Date() },
    });

    // Auto-track calories burned
    const caloriesBurned = workout.calories || 0;
    const today = getTodayDate();

    if (caloriesBurned > 0) {
      const existing = await prisma.dailyCalories.findUnique({
        where: { userId_date: { userId: dbUser.id, date: today } },
      });

      if (existing) {
        await prisma.dailyCalories.update({
          where: { userId_date: { userId: dbUser.id, date: today } },
          data: {
            caloriesBurned: existing.caloriesBurned + caloriesBurned,
            netCalories: (existing.caloriesBurned + caloriesBurned) - existing.caloriesEaten,
            workoutDone: true,
          },
        });
      } else {
        await prisma.dailyCalories.create({
          data: {
            userId: dbUser.id,
            date: today,
            caloriesBurned,
            caloriesEaten: 0,
            netCalories: caloriesBurned,
            workoutDone: true,
          },
        });
      }
    }

    return NextResponse.json({ success: true, workout, caloriesBurned });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        workouts: {
          orderBy: { createdAt: "desc" },
        },
        progress: {
          orderBy: { loggedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Total workouts completed
    const completedWorkouts = dbUser.workouts.filter((w) => w.completedAt);
    const totalWorkouts = completedWorkouts.length;

    // Total calories burned
    const totalCalories = completedWorkouts.reduce(
      (sum, w) => sum + (w.calories || 0),
      0
    );

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workoutDates = completedWorkouts
      .map((w) => {
        const d = new Date(w.completedAt!);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    for (let i = 0; i < workoutDates.length; i++) {
      const expected = today.getTime() - i * 86400000;
      if (workoutDates[i] === expected) {
        streak++;
      } else {
        break;
      }
    }

    // Weekly workout data for chart (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayWorkouts = completedWorkouts.filter((w) => {
        const d = new Date(w.completedAt!);
        return d >= date && d < nextDate;
      });

      weeklyData.push({
        day: date.toLocaleDateString("en-IN", { weekday: "short" }),
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((s, w) => s + (w.calories || 0), 0),
      });
    }

    // Progress data for weight chart
    const progressData = dbUser.progress
      .reverse()
      .map((p) => ({
        date: new Date(p.loggedAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        weight: p.weight,
        bodyFat: p.bodyFat,
      }));

    return NextResponse.json({
      totalWorkouts,
      totalCalories,
      streak,
      weeklyData,
      progressData,
      currentWeight: dbUser.currentWeight,
      targetWeight: dbUser.targetWeight,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
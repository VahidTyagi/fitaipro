import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({}, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        name: true, gender: true, age: true,
        currentWeight: true, targetWeight: true, height: true,
        goal: true, fitnessLevel: true, workoutType: true,
        dietType: true, plan: true,
        preferredWorkoutTime: true,
        workoutDaysPerWeek: true,
        dailySteps: true,
        wakeTime: true, sleepTime: true,
      },
    });

    return NextResponse.json(user || {});
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
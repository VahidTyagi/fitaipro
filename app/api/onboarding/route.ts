import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        gender: body.gender || null,
        goal: body.goal || null,
        fitnessLevel: body.fitnessLevel || null,
        workoutType: body.workoutType || null,
        dietType: body.dietType || null,
        age: body.age ? parseInt(body.age) : null,
        currentWeight: body.currentWeight ? parseFloat(body.currentWeight) : null,
        targetWeight: body.targetWeight ? parseFloat(body.targetWeight) : null,
        height: body.height ? parseFloat(body.height) : null,
        // New fields
        preferredWorkoutTime: body.preferredWorkoutTime || null,
        workoutDaysPerWeek: body.workoutDaysPerWeek ? parseInt(body.workoutDaysPerWeek) : 3,
        dailySteps: body.dailySteps ? parseInt(body.dailySteps) : 5000,
        wakeTime: body.wakeTime || null,
        sleepTime: body.sleepTime || null,
        onboardingDone: true,
      },
      create: {
        clerkId: userId,
        email: "",
        gender: body.gender || null,
        goal: body.goal || null,
        fitnessLevel: body.fitnessLevel || null,
        workoutType: body.workoutType || null,
        dietType: body.dietType || null,
        age: body.age ? parseInt(body.age) : null,
        currentWeight: body.currentWeight ? parseFloat(body.currentWeight) : null,
        targetWeight: body.targetWeight ? parseFloat(body.targetWeight) : null,
        height: body.height ? parseFloat(body.height) : null,
        preferredWorkoutTime: body.preferredWorkoutTime || null,
        workoutDaysPerWeek: body.workoutDaysPerWeek ? parseInt(body.workoutDaysPerWeek) : 3,
        dailySteps: body.dailySteps ? parseInt(body.dailySteps) : 5000,
        wakeTime: body.wakeTime || null,
        sleepTime: body.sleepTime || null,
        onboardingDone: true,
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
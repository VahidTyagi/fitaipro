import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      goal,
      fitnessLevel,
      workoutType,
      dietType,
      age,
      currentWeight,
      targetWeight,
      height,
    } = body;

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        goal,
        fitnessLevel,
        workoutType,
        dietType,
        age: age ? parseInt(age) : null,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        height: height ? parseFloat(height) : null,
        onboardingDone: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
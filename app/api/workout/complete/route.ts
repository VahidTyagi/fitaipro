import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    return NextResponse.json({ success: true, workout });
  } catch (error) {
    console.error("Complete workout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
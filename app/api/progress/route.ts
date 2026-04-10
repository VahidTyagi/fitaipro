import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { weight, bodyFat, notes } = await req.json();

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const progress = await prisma.progress.create({
      data: {
        userId: dbUser.id,
        weight: weight || null,
        bodyFat: bodyFat || null,
        notes: notes || null,
      },
    });

    // Update current weight on user profile
    if (weight) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { currentWeight: weight },
      });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
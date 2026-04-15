import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const status = getSubscriptionStatus(dbUser);

    // Elite only
    if (dbUser.plan !== "elite") {
      return NextResponse.json({
        error: "elite_required",
        message: "Video body progress tracking is an Elite plan feature.",
      }, { status: 403 });
    }

    const formData = await req.formData();
    const video = formData.get("video") as File;
    const notes = formData.get("notes") as string || "";

    if (!video) return NextResponse.json({ error: "No video" }, { status: 400 });
    if (video.size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: "Video must be under 30MB" }, { status: 400 });
    }

    // For now, log the progress entry (video storage via Vercel Blob in Week 5)
    const progress = await prisma.progress.create({
      data: {
        userId: dbUser.id,
        notes: `[VIDEO UPLOAD] ${notes} | File: ${video.name} | Size: ${(video.size / 1024 / 1024).toFixed(1)}MB`,
        weight: dbUser.currentWeight,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Progress video logged. Video storage via Vercel Blob coming soon.",
      progress,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}
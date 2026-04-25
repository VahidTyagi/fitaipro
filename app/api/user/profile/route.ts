import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Clean the name — remove email-like patterns
    const cleanName = name.trim()
      .replace(/[+].*/, "") // remove +suffix
      .trim();

    if (cleanName.length < 2) {
      return NextResponse.json({ error: "Name too short" }, { status: 400 });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: { name: cleanName },
    });

    return NextResponse.json({ success: true, name: cleanName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
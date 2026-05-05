import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const text = await req.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const name = (body?.name || "").toString().trim();
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: { name },
    });

    return NextResponse.json({ success: true, name: updated.name });
  } catch (error: any) {
    console.error("update-profile:", error.message);
    return NextResponse.json(
      { error: "Update failed: " + error.message },
      { status: 500 }
    );
  }
}
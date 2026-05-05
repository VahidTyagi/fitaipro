import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { subscriptionStatus: "cancelled" },
    });

    return NextResponse.json({ success: true, message: "Subscription cancelled. Access continues until expiry." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
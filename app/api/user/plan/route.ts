import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ trialActive: false, daysLeft: 0 });
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ trialActive: false, daysLeft: 0 });

    const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
    const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
    const isPaid = dbUser.plan === "pro" || dbUser.plan === "elite";
    const trialActive = daysLeft > 0 || isPaid;

    return NextResponse.json({ trialActive, daysLeft, isPaid, plan: dbUser.plan });
  } catch {
    return NextResponse.json({ trialActive: false, daysLeft: 0 });
  }
}
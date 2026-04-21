import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ trialActive: false, daysLeft: 0, isPaid: false, plan: "free" });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ trialActive: false, daysLeft: 0, isPaid: false, plan: "free" });

    const status = getSubscriptionStatus(dbUser);

    return NextResponse.json({
      trialActive: status.isTrialActive,
      daysLeft: status.daysLeft,
      isPaid: status.isPaid,
      plan: status.plan,
      billingCycle: status.billingCycle,
      label: status.label,
      nutritionDays: status.nutritionDays,
      chatLimit: status.chatLimit,
      subscriptionEnd: status.subscriptionEnd?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("User plan error:", error);
    return NextResponse.json({ trialActive: false, daysLeft: 0, isPaid: false, plan: "free" });
  }
}
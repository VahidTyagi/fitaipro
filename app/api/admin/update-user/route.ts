import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["vahidtyagi007007@gmail.com", "fitaipro.official@gmail.com"];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || !ADMIN_EMAILS.includes(admin.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId: targetId, action, days, plan } = await req.json();

    if (action === "extend_trial") {
      const user = await prisma.user.findUnique({ where: { id: targetId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const currentTrialEnd = user.trialEnd && new Date(user.trialEnd) > new Date()
        ? new Date(user.trialEnd)
        : new Date();
      currentTrialEnd.setDate(currentTrialEnd.getDate() + (days || 7));
      await prisma.user.update({
        where: { id: targetId },
        data: { trialEnd: currentTrialEnd },
      });
    }

    if (action === "set_plan") {
      const validPlans = ["free", "pro", "elite"];
      if (!validPlans.includes(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const subscriptionEnd = plan !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
      await prisma.user.update({
        where: { id: targetId },
        data: {
          plan,
          subscriptionStatus: plan !== "free" ? "active" : "inactive",
          subscriptionEnd,
          trialEnd: plan !== "free" ? subscriptionEnd : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
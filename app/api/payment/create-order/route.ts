import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { razorpay, PLANS } from "@/lib/razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planKey } = await req.json();

    if (!PLANS[planKey as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const planDetails = PLANS[planKey as keyof typeof PLANS];

    const order = await razorpay.orders.create({
      amount: planDetails.amount,
      currency: planDetails.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: dbUser.id,
        plan: planDetails.plan,
        billingCycle: planDetails.billingCycle,
        userEmail: dbUser.email,
      },
    });

    await prisma.payment.create({
      data: {
        userId: dbUser.id,
        razorpayOrderId: order.id,
        amount: planDetails.amount,
        currency: planDetails.currency,
        status: "created",
        plan: planDetails.plan,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: planDetails.amount,
      currency: planDetails.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: "FitAI Pro",
      description: planDetails.description,
      plan: planDetails.plan,
      billingCycle: planDetails.billingCycle,
      prefill: { name: dbUser.name || "", email: dbUser.email },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
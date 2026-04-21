import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billingCycle,
    } = body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();

    // Set correct end date based on billing cycle
    if (billingCycle === "yearly") {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      // Monthly — exactly 30 days
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    }

    // Update user
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        plan,
        subscriptionStatus: "active",
        subscriptionPlan: plan,
        subscriptionStart,
        subscriptionEnd,
        razorpayPaymentId: razorpay_payment_id,
        // Also update trialEnd to match subscriptionEnd so nutrition page works correctly
        trialEnd: subscriptionEnd,
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
    });

    return NextResponse.json({
      success: true,
      plan,
      billingCycle: billingCycle || "monthly",
      subscriptionEnd: subscriptionEnd.toISOString(),
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Payment verification failed", details: error.message }, { status: 500 });
  }
}
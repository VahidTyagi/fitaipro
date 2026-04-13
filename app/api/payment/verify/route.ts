import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billingCycle } = await req.json();

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Calculate correct subscription end date
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    if (billingCycle === "yearly") {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        plan,
        subscriptionStatus: "active",
        subscriptionPlan: plan,
        subscriptionStart,
        subscriptionEnd,
        razorpayPaymentId: razorpay_payment_id,
        // Also extend trial so nutrition page shows correctly
        trialEnd: subscriptionEnd,
      },
    });

    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
    });

    return NextResponse.json({ success: true, plan, subscriptionEnd });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
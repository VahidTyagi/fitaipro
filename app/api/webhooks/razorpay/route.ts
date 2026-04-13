import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const { userId, plan } = event.payload.payment.entity.notes || {};
      if (userId && plan) {
        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        await prisma.user.update({
          where: { id: userId },
          data: { plan, subscriptionStatus: "active", subscriptionPlan: plan, subscriptionEnd },
        });
      }
    }

    if (event.event === "payment.failed") {
      const orderId = event.payload.payment.entity.order_id;
      if (orderId) await prisma.payment.updateMany({ where: { razorpayOrderId: orderId }, data: { status: "failed" } });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
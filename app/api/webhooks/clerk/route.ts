import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return NextResponse.json({ error: "No secret" }, { status: 400 });

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address || "";
    // Build full name properly
    const nameParts = [first_name, last_name].filter(Boolean);
    const name = nameParts.length > 0 ? nameParts.join(" ") : email.split("@")[0];

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { name, imageUrl: image_url || null },
      create: {
        clerkId: id,
        email,
        name,
        imageUrl: image_url || null,
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (evt.type === "user.updated") {
    const { id, first_name, last_name, image_url } = evt.data;
    const nameParts = [first_name, last_name].filter(Boolean);
    const name = nameParts.length > 0 ? nameParts.join(" ") : null;

    await prisma.user.updateMany({
      where: { clerkId: id },
      data: { name, imageUrl: image_url || null },
    });
  }

  if (evt.type === "user.deleted") {
    if (evt.data.id) {
      await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
    }
  }

  return NextResponse.json({ received: true });
}
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function buildName(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  const parts = [firstName, lastName].filter(
    (p) => p && p.trim() && !p.includes("+") && !p.includes("@")
  );
  if (parts.length > 0) return parts.join(" ").trim();
  if (email) {
    const local = email.split("@")[0].split("+")[0];
    return local
      .replace(/[._-]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "User";
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET)
    return NextResponse.json({ error: "No webhook secret configured" }, { status: 400 });

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // ── user.created ──────────────────────────────────────────────────────────
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const name = buildName(first_name, last_name, email);

    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          name,
          imageUrl: image_url || null,
        },
        create: {
          clerkId: id,
          email,
          name,
          imageUrl: image_url || null,
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (err) {
      console.error("Error creating user from webhook:", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  // ── user.updated ──────────────────────────────────────────────────────────
  if (evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const name = buildName(first_name, last_name, email);

    try {
      await prisma.user.updateMany({
        where: { clerkId: id },
        data: {
          name,
          imageUrl: image_url || null,
          ...(email && { email }),
        },
      });
    } catch (err) {
      console.error("Error updating user from webhook:", err);
    }
  }

  // ── user.deleted ──────────────────────────────────────────────────────────
  if (evt.type === "user.deleted" && evt.data.id) {
    try {
      await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
    } catch (err) {
      console.error("Error deleting user from webhook:", err);
    }
  }

  return NextResponse.json({ received: true });
}
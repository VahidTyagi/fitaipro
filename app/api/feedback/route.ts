import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth().catch(() => ({ userId: null }));
    const body = await req.json();
    const { type, message, page } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Logs appear in Vercel Dashboard → Logs (real-time)
    console.log(JSON.stringify({
      event: "USER_FEEDBACK",
      type: type || "general",
      message: message.trim(),
      page: page || "unknown",
      userId: userId || "anonymous",
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
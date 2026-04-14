import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function callAI(systemPrompt: string, history: any[], message: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
        temperature: 0.8,
        max_tokens: 500,
      });
      return completion.choices[0]?.message?.content || "";
    } catch { console.log("Groq failed, trying Gemini..."); }
  }
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `${systemPrompt}\n\n${history.map((h: any) => `${h.role}: ${h.content}`).join("\n")}\n\nUser: ${message}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }
  throw new Error("No AI API configured");
}

function getDailyLimit(plan: string, isTrialActive: boolean): number {
  if (plan === "elite") return 999999; // unlimited
  if (plan === "pro") return 100;
  if (isTrialActive) return 10; // free trial
  return 0; // expired free
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, history } = await req.json();
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const status = getSubscriptionStatus(dbUser);
    const dailyLimit = getDailyLimit(status.plan, status.isTrialActive);

    // Check if daily limit reached
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resetDate = dbUser.chatResetDate ? new Date(dbUser.chatResetDate) : null;
    const isNewDay = !resetDate || resetDate < today;

    let messagesUsed = isNewDay ? 0 : (dbUser.chatMessagesUsed || 0);

    if (dailyLimit === 0) {
      return NextResponse.json({
        error: "rate_limit",
        message: "Your free trial has ended. Upgrade to Pro to continue chatting with your AI coach.",
        upgradeRequired: true,
      }, { status: 403 });
    }

    if (messagesUsed >= dailyLimit) {
      return NextResponse.json({
        error: "rate_limit",
        message: `You've used all ${dailyLimit} messages for today. ${status.plan === "free" ? "Upgrade to Pro for 100 messages/day!" : "Limit resets tomorrow."}`,
        messagesUsed,
        dailyLimit,
        upgradeRequired: status.plan !== "pro" && status.plan !== "elite",
      }, { status: 429 });
    }

    const systemPrompt = `You are an expert AI fitness coach for FitAI Pro, a fitness app for Indian users.
USER: Name: ${dbUser?.name || "User"}, Goal: ${dbUser?.goal?.replace(/_/g, " ") || "fitness"}, Level: ${dbUser?.fitnessLevel || "beginner"}, Diet: ${dbUser?.dietType || "any"}, Weight: ${dbUser?.currentWeight || "?"}kg → ${dbUser?.targetWeight || "?"}kg, Plan: ${status.plan}
GUIDELINES: Give personalized advice. Suggest Indian foods (dal, roti, paneer etc) when relevant. Keep responses to 3-5 sentences. Be encouraging. For injuries recommend a doctor.`;

    const response = await callAI(systemPrompt, history || [], message);

    // Update message count
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        chatMessagesUsed: messagesUsed + 1,
        chatResetDate: isNewDay ? today : dbUser.chatResetDate,
      },
    });

    return NextResponse.json({
      response,
      messagesUsed: messagesUsed + 1,
      dailyLimit,
      messagesLeft: dailyLimit - messagesUsed - 1,
    });
  } catch (error) {
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
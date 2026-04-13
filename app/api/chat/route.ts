import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { message, history } = await req.json();
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

    const systemPrompt = `You are an expert AI fitness coach for FitAI Pro, a fitness app for Indian users.
USER: Name: ${dbUser?.name || "User"}, Goal: ${dbUser?.goal?.replace(/_/g, " ") || "fitness"}, Level: ${dbUser?.fitnessLevel || "beginner"}, Diet: ${dbUser?.dietType || "any"}, Weight: ${dbUser?.currentWeight || "?"}kg → ${dbUser?.targetWeight || "?"}kg
RULES: Give personalized advice. Suggest Indian foods (dal, roti, paneer etc) when relevant. Keep responses to 3-5 sentences. Be encouraging. Recommend doctor for injuries.`;

    const response = await callAI(systemPrompt, history || [], message);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
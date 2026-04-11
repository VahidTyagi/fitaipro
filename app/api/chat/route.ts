import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, history } = await req.json();

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

    const systemPrompt = `You are an expert AI fitness coach for FitAI Pro, a fitness app for Indian users. 

USER PROFILE:
- Name: ${dbUser?.name || "User"}
- Goal: ${dbUser?.goal?.replace(/_/g, " ") || "general fitness"}
- Fitness Level: ${dbUser?.fitnessLevel || "beginner"}
- Workout Type: ${dbUser?.workoutType?.replace(/_/g, " ") || "home workout"}
- Diet: ${dbUser?.dietType?.replace(/_/g, " ") || "no preference"}
- Current Weight: ${dbUser?.currentWeight ? dbUser.currentWeight + "kg" : "unknown"}
- Target Weight: ${dbUser?.targetWeight ? dbUser.targetWeight + "kg" : "unknown"}

GUIDELINES:
- Give personalized advice based on their profile
- For Indian users: suggest desi food options (dal, roti, sabzi, paneer, etc.) when relevant
- Keep responses concise (3-5 sentences max unless asking for a plan)
- Be encouraging and motivating
- Always prioritize safety
- If asked about injuries or medical conditions, recommend seeing a doctor
- Use simple language, mix of English and easy-to-understand terms`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "I couldn't process that. Please try again.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
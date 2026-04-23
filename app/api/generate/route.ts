import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

async function callAI(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const c = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2500,
      });
      const t = c.choices[0]?.message?.content || "";
      if (t) return t;
    } catch (e) { console.log("Groq failed:", e); }
  }
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  throw new Error("No AI available");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const status = getSubscriptionStatus(dbUser);
    if (!status.isPaid && !status.isTrialActive) {
      return NextResponse.json({ error: "Pro plan required for custom plans" }, { status: 403 });
    }

    const { schedule } = await req.json();
    if (!schedule?.length) return NextResponse.json({ error: "Schedule is empty" }, { status: 400 });

    // Format schedule for AI
    const scheduleText = schedule.map((b: any) =>
      `${b.startTime}–${b.endTime}: [${b.type.replace("_", " ").toUpperCase()}] ${b.detail}${b.steps ? ` (${b.steps} steps)` : ""}`
    ).join("\n");

    const totalSteps = schedule.reduce((s: number, b: any) => s + (b.steps || 0), 0);
    const exerciseBlocks = schedule.filter((b: any) => b.type === "exercise_gym" || b.type === "exercise_home");
    const mealBlocks = schedule.filter((b: any) => b.type === "meal");
    const sleepBlock = schedule.find((b: any) => b.type === "sleep");
    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const currentWeight = dbUser.currentWeight || 75;
    const targetWeight = dbUser.targetWeight || 70;

    const prompt = `You are an expert Indian nutritionist and fitness coach. Analyze this person's daily schedule and create an optimized nutrition + workout plan.

PERSON:
- Goal: ${goal.replace(/_/g, " ")}
- Diet: ${dietType}
- Weight: ${currentWeight}kg → ${targetWeight}kg (target)
- Total steps/day: ${totalSteps}

THEIR DAILY SCHEDULE:
${scheduleText}

EXERCISE SESSIONS: ${exerciseBlocks.length}
MEALS PLANNED: ${mealBlocks.length}

Create a fully optimized plan that:
1. Times meals AROUND workouts (pre/post workout nutrition)
2. Uses ONLY Indian foods (roti, dal, paneer, chicken, eggs, rice, sabzi, fruits, etc.)
3. Calculates calories based on exercise intensity + steps + goal
4. Gives specific advice for each workout session
5. Considers their sleep schedule

RESPOND ONLY with this exact JSON (no extra text, no markdown):
{
  "summary": "2-3 sentence personalized summary",
  "totalCaloriesNeeded": 2200,
  "proteinNeeded": 120,
  "exerciseSummary": "Brief advice on their exercise combination",
  "mealTimings": [
    {
      "time": "6:00 AM",
      "meal": "Pre-workout meal name",
      "calories": 300,
      "protein": 15,
      "description": "2 bananas + 1 glass milk OR specific Indian food",
      "reason": "Why this meal at this time (pre/post workout, energy, recovery)"
    }
  ],
  "workoutAdvice": [
    {
      "session": "6:30–8:00 AM Gym",
      "focus": "What to focus on",
      "tip": "Specific tip for this session given their schedule"
    }
  ],
  "hydration": "Specific water intake advice based on exercise sessions",
  "sleepAdvice": "Based on their sleep schedule (${sleepBlock ? `${sleepBlock.startTime}–${sleepBlock.endTime}` : "not set"})",
  "weeklyGoal": "What they can achieve in 4 weeks following this schedule",
  "warnings": ["Any concerning patterns like too little sleep, insufficient recovery, etc."]
}`;

    const responseText = await callAI(prompt);
    const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid AI response");

    const plan = JSON.parse(match[0]);

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Custom plan error:", error);
    return NextResponse.json({ error: "Failed to generate plan", details: error.message }, { status: 500 });
  }
}
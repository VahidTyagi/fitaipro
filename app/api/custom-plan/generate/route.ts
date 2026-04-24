import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateFitness, getWorkoutRecommendations } from "@/lib/fitness-engine";

async function callAI(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const c = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, max_tokens: 3000,
      });
      const t = c.choices[0]?.message?.content || "";
      if (t.includes("{")) return t;
    } catch (e) { console.error("Groq:", e); }
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

    const { schedule } = await req.json();
    if (!schedule?.length) return NextResponse.json({ error: "Schedule empty" }, { status: 400 });

    // Calculate science-based fitness metrics
    let fitnessCalc = null;
    let workoutRecs = null;

    if (dbUser.currentWeight && dbUser.height && dbUser.age) {
      const profile = {
        gender: dbUser.gender || "male",
        age: dbUser.age,
        currentWeight: dbUser.currentWeight,
        targetWeight: dbUser.targetWeight || dbUser.currentWeight,
        height: dbUser.height,
        goal: dbUser.goal || "stay_fit",
        fitnessLevel: dbUser.fitnessLevel || "beginner",
        workoutDaysPerWeek: (dbUser as any).workoutDaysPerWeek || 3,
        dailySteps: (dbUser as any).dailySteps || 5000,
      };
      fitnessCalc = calculateFitness(profile);
      workoutRecs = getWorkoutRecommendations(profile);
    }

    const exerciseBlocks = schedule.filter((b: any) =>
      b.type === "exercise_gym" || b.type === "exercise_home"
    );
    const mealBlocks = schedule.filter((b: any) => b.type === "meal");
    const sleepBlock = schedule.find((b: any) => b.type === "sleep");
    const totalSteps = schedule.reduce((s: number, b: any) => s + (b.steps || 0), 0);

    const scheduleText = schedule.map((b: any) =>
      `${b.startTime}–${b.endTime}: [${b.type.replace(/_/g, " ").toUpperCase()}] ${b.detail}${b.steps > 0 ? ` (${b.steps} steps)` : ""}`
    ).join("\n");

    const weightDiff = dbUser.targetWeight && dbUser.currentWeight
      ? dbUser.currentWeight - dbUser.targetWeight
      : null;

    const prompt = `You are an expert Indian nutritionist, fitness coach, and lifestyle planner.

PERSON PROFILE:
- Name: ${dbUser.name || "User"}
- Gender: ${dbUser.gender || "not specified"}
- Age: ${dbUser.age || "not specified"}
- Weight: ${dbUser.currentWeight || "?"}kg → Target: ${dbUser.targetWeight || "same"}kg
- Height: ${dbUser.height || "?"}cm
- Goal: ${(dbUser.goal || "stay_fit").replace(/_/g, " ")}
- Diet: ${dbUser.dietType || "any"}
- Fitness Level: ${dbUser.fitnessLevel || "beginner"}
- Workout preference: ${(dbUser as any).preferredWorkoutTime || "flexible"}

SCIENCE-BASED CALCULATIONS:
${fitnessCalc ? `
- BMR: ${fitnessCalc.bmr} kcal/day
- TDEE: ${fitnessCalc.tdee} kcal/day  
- Recommended daily calories: ${fitnessCalc.targetCalories} kcal
- Protein target: ${fitnessCalc.protein}g/day
- BMI: ${fitnessCalc.bmi} (${fitnessCalc.bmiCategory})
- Weekly weight change: ${fitnessCalc.weeklyWeightChange}kg/week
- Estimated weeks to goal: ${fitnessCalc.weeksToGoal > 0 ? fitnessCalc.weeksToGoal : "N/A (maintenance)"}
- Age group: ${fitnessCalc.ageGroup}
- Special notes: ${fitnessCalc.specialNotes.join("; ") || "none"}
` : "No body data available — use general recommendations"}

TODAY'S SCHEDULE:
${scheduleText}

EXERCISE SESSIONS: ${exerciseBlocks.length} sessions
TOTAL STEPS: ${totalSteps}
SLEEP: ${sleepBlock ? `${sleepBlock.startTime} to ${sleepBlock.endTime}` : "not set"}

YOUR TASK: Create a fully optimized personalized plan. Use ONLY Indian foods (dal, roti, paneer, chicken, eggs, rice, sabzi, dosa, idli, upma, sprouts, fruits etc.)

${dbUser.age && dbUser.age >= 60 ? "SENIOR CITIZEN: Low impact exercises, joint health priority, higher protein, shorter sessions." : ""}
${dbUser.gender === "female" && dbUser.goal === "build_muscle" ? "FEMALE MUSCLE BUILDING: Full body training, higher reps, progressive overload, adequate protein." : ""}

RESPOND ONLY with this JSON (no markdown, no code blocks, no extra text):
{
  "headline": "Short catchy plan title e.g. '${dbUser.name || "Your"} 6-Week Weight Loss Blueprint'",
  "summary": "2-3 sentences describing the personalized plan based on their specific schedule",
  "totalCalories": ${fitnessCalc?.targetCalories || 2000},
  "proteinTarget": ${fitnessCalc?.protein || 100},
  "goalTimeline": "e.g. 'At this pace you can lose 8kg in 12 weeks — reaching 72kg by July 2025'",
  "estimatedWeeksToGoal": ${fitnessCalc?.weeksToGoal || 0},
  "mealTimings": [
    {
      "time": "7:00 AM",
      "meal": "Specific Indian meal name",
      "calories": 350,
      "protein": 20,
      "reason": "Why this meal at this exact time (pre/post workout, energy timing)"
    }
  ],
  "workoutAdvice": [
    {
      "session": "Session name from their schedule",
      "focus": "What to focus on this session",
      "tip": "Specific tip for this session in their context",
      "duration": "45 mins"
    }
  ],
  "hourlyTimetable": [
    {
      "time": "6:00 AM",
      "activity": "Activity description",
      "note": "Short tip or note (optional)"
    }
  ],
  "hydration": "Specific water intake (e.g. 3.5L because of 2 exercise sessions + office work)",
  "sleepScore": "Evaluate their sleep duration and give advice",
  "weeklyMilestone": "What they should achieve in the first week",
  "warnings": ["Any health/safety concerns with their schedule"],
  "motivationNote": "A short personalized motivational message"
}`;

    const raw = await callAI(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned invalid format");

    const plan = JSON.parse(match[0]);

    return NextResponse.json({ success: true, plan, fitnessData: fitnessCalc });
  } catch (error: any) {
    console.error("Custom plan error:", error);
    return NextResponse.json({ error: "Failed", details: error.message }, { status: 500 });
  }
}
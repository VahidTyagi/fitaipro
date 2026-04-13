import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { EXERCISE_LIBRARY } from "@/lib/exercises";

async function callAI(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });
      return completion.choices[0]?.message?.content || "";
    } catch (e) {
      console.log("Groq failed, trying Gemini...");
    }
  }
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  throw new Error("No AI API key configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env.local");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { workoutType } = await req.json();
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const goal = dbUser.goal || "stay_fit";
    const level = dbUser.fitnessLevel || "beginner";
    const type = workoutType || dbUser.workoutType || "home_no_equipment";
    const availableExercises = EXERCISE_LIBRARY.filter((e) => e.type === type);
    const exerciseIds = availableExercises.map((e) => e.id).join(", ");

    const prompt = `You are an expert personal trainer. Create a personalized workout.
USER: Goal: ${goal.replace(/_/g, " ")}, Level: ${level}, Type: ${type.replace(/_/g, " ")}
AVAILABLE EXERCISE IDs (use ONLY these): ${exerciseIds}
Respond ONLY with valid JSON, no other text:
{"title":"workout name","duration":40,"calories":300,"level":"${level}","warmup":"warmup description","cooldown":"cooldown description","coachTip":"motivational tip","exercises":[{"exerciseId":"pushup","sets":3,"reps":"12","rest":"45s","notes":"keep core tight"}]}`;

    const responseText = await callAI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const workoutPlan = JSON.parse(jsonMatch[0]);

    const enrichedExercises = workoutPlan.exercises.map((ex: any) => {
      const exerciseData = availableExercises.find((e) => e.id === ex.exerciseId);
      return {
        ...ex,
        name: exerciseData?.name || ex.exerciseId,
        muscle: exerciseData?.muscle || "Full Body",
        gifId: exerciseData?.gifId || null,
        instructions: exerciseData?.instructions || [],
        tips: exerciseData?.tips || "",
      };
    });

    const finalWorkout = { ...workoutPlan, exercises: enrichedExercises };
    const savedWorkout = await prisma.workout.create({
      data: {
        userId: dbUser.id,
        title: finalWorkout.title,
        type, level,
        duration: finalWorkout.duration,
        calories: finalWorkout.calories,
        exercises: finalWorkout as any,
        aiGenerated: true,
      },
    });

    return NextResponse.json({ success: true, workout: finalWorkout, workoutId: savedWorkout.id });
  } catch (error) {
    console.error("Workout generation error:", error);
    return NextResponse.json({ error: "Failed to generate workout", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
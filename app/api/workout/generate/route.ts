import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { EXERCISE_LIBRARY } from "@/lib/exercises";

async function callAI(prompt: string): Promise<string> {
  const errors: string[] = [];

  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1200,
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text) return text;
    } catch (e: any) { errors.push(`Groq: ${e.message}`); }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (e: any) { errors.push(`Gemini: ${e.message}`); }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workoutType } = await req.json();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        workouts: {
          where: { completedAt: { not: null } },
          orderBy: { completedAt: "desc" },
          take: 3,
        },
      },
    });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const goal = dbUser.goal || "stay_fit";
    const level = dbUser.fitnessLevel || "beginner";
    const type = workoutType || dbUser.workoutType || "home_no_equipment";

    // Get available exercises for this type
    const availableExercises = EXERCISE_LIBRARY.filter((e) => e.type === type);
    const exerciseList = availableExercises.map((e) => `${e.id} (${e.name}, targets: ${e.muscleGroup})`).join(", ");

    // Get recently worked muscle groups to avoid
    const recentMuscleGroups: string[] = [];
    for (const w of dbUser.workouts.slice(0, 2)) {
      const exercises = (w.exercises as any)?.exercises || [];
      for (const ex of exercises) {
        const found = availableExercises.find((e) => e.id === ex.exerciseId);
        if (found && !["core", "cardio"].includes(found.muscleGroup)) {
          recentMuscleGroups.push(found.muscleGroup);
        }
      }
    }
    const uniqueRecentGroups = [...new Set(recentMuscleGroups)];

    const avoidInstruction = uniqueRecentGroups.length > 0
      ? `IMPORTANT: User worked these muscle groups recently — try to AVOID them today: ${uniqueRecentGroups.join(", ")}. EXCEPTION: if goal is belly_fat or core, abs/core exercises can always be included.`
      : "No recent workout data — create a balanced full-body workout.";

    const prompt = `You are an expert personal trainer. Create a unique personalized workout.

USER: Goal: ${goal.replace(/_/g, " ")}, Level: ${level}, Type: ${type.replace(/_/g, " ")}
${avoidInstruction}

AVAILABLE EXERCISES (use ONLY these IDs): ${exerciseList}

CREATE a workout with 6-8 exercises. Make it DIFFERENT from yesterday.
Respond ONLY with valid JSON:
{
  "title": "unique workout name",
  "duration": 40,
  "calories": 300,
  "level": "${level}",
  "musclesFocus": ["chest", "triceps"],
  "warmup": "5 min warmup description",
  "cooldown": "5 min cooldown description",
  "coachTip": "personalized tip based on goal",
  "exercises": [
    {
      "exerciseId": "pushup",
      "sets": 3,
      "reps": "12",
      "rest": "45s",
      "notes": "form tip"
    }
  ]
}`;

    const responseText = await callAI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    const workoutPlan = JSON.parse(jsonMatch[0]);

    // Enrich exercises with full data
    const enrichedExercises = workoutPlan.exercises.map((ex: any) => {
      const exerciseData = availableExercises.find((e) => e.id === ex.exerciseId);
      return {
        ...ex,
        name: exerciseData?.name || ex.exerciseId,
        muscle: exerciseData?.muscle || "Full Body",
        muscleGroup: exerciseData?.muscleGroup || "full_body",
        gifUrl: exerciseData?.gifUrl || null,
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
  } catch (error: any) {
    console.error("Workout generation error:", error);
    return NextResponse.json({
      error: "Failed to generate workout",
      details: error.message,
    }, { status: 500 });
  }
}
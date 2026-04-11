import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXERCISE_LIBRARY } from "@/lib/exercises";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
    const exerciseNames = availableExercises.map((e) => e.id).join(", ");

    const prompt = `You are an expert personal trainer. Create a personalized workout plan.

USER PROFILE:
- Goal: ${goal.replace(/_/g, " ")}
- Fitness Level: ${level}
- Workout Type: ${type.replace(/_/g, " ")}

AVAILABLE EXERCISE IDs (use ONLY these): ${exerciseNames}

Create a workout with 6-8 exercises. Respond ONLY with valid JSON, no other text, no markdown:

{
  "title": "workout name",
  "duration": 40,
  "calories": 300,
  "level": "${level}",
  "warmup": "2-3 sentence warmup description",
  "cooldown": "2-3 sentence cooldown description",
  "coachTip": "one motivational tip from the AI coach",
  "exercises": [
    {
      "exerciseId": "pushup",
      "sets": 3,
      "reps": "12",
      "rest": "45s",
      "notes": "optional form note"
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON safely
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const workoutPlan = JSON.parse(jsonMatch[0]);

    // Map exercise IDs to full exercise data
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

    // Save to database
    const savedWorkout = await prisma.workout.create({
      data: {
        userId: dbUser.id,
        title: finalWorkout.title,
        type,
        level,
        duration: finalWorkout.duration,
        calories: finalWorkout.calories,
        exercises: finalWorkout as any,
        aiGenerated: true,
      },
    });

    return NextResponse.json({
      success: true,
      workout: finalWorkout,
      workoutId: savedWorkout.id,
    });
  } catch (error) {
    console.error("Workout generation error:", error);
    return NextResponse.json({ error: "Failed to generate workout" }, { status: 500 });
  }
}
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check trial
    const trialEnd = dbUser.trialEnd ? new Date(dbUser.trialEnd) : null;
    const trialActive = trialEnd ? trialEnd > new Date() : false;
    if (!trialActive && dbUser.plan === "free") {
      return NextResponse.json({ error: "Trial expired. Please upgrade." }, { status: 403 });
    }

    const goal = dbUser.goal || "stay_fit";
    const dietType = dbUser.dietType || "vegetarian";
    const currentWeight = dbUser.currentWeight || 70;
    const targetWeight = dbUser.targetWeight || 65;
    const isWeightLoss = targetWeight < currentWeight;

    const prompt = `You are an expert Indian nutritionist. Create a 7-day meal plan.

USER PROFILE:
- Goal: ${goal.replace(/_/g, " ")}
- Diet: ${dietType.replace(/_/g, " ")}
- Current Weight: ${currentWeight}kg
- Target Weight: ${targetWeight}kg
- Direction: ${isWeightLoss ? "weight loss" : "muscle gain or maintenance"}

RULES:
- Use authentic Indian foods (dal, roti, rice, sabzi, paneer, chicken, fish, etc.)
- Include breakfast, lunch, snack, dinner for each day
- Each meal must have name, calories, protein(g), carbs(g), fat(g)
- Vary meals across days
- Keep total daily calories: ${isWeightLoss ? "1600-1800" : "2200-2500"} kcal
- ${dietType === "vegetarian" ? "NO meat or fish" : ""}
- ${dietType === "vegan" ? "NO dairy, meat, or eggs" : ""}

Respond ONLY with valid JSON, no other text:

{
  "targetCalories": 1700,
  "targetProtein": 120,
  "days": [
    {
      "day": 1,
      "totalCalories": 1680,
      "totalProtein": 95,
      "meals": [
        {
          "type": "Breakfast",
          "name": "Moong dal chilla with green chutney",
          "calories": 320,
          "protein": 18,
          "carbs": 42,
          "fat": 6,
          "quantity": "2 chillas"
        }
      ]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const mealPlan = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, mealPlan });
  } catch (error) {
    console.error("Nutrition generation error:", error);
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}